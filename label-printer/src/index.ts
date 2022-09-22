import axios from 'axios';
import * as fs from 'fs';
import * as util from 'util';
import * as conf from 'config';
import * as tmp from 'tmp';
import * as child_process from 'child_process';

const config = conf as any;
const async_exec = util.promisify(child_process.exec);

interface ChildProcessResult {
  code?: number;
  stdout: string;
  stderr: string;
}

interface LabelPrinter {
  title: string,
  printer: string,
  papersize: string,
  code: string,
  options: {[key: string]: string}
}
type LabelPrintJobStatus = 'waiting'|'processing'|'completed'|'error';

type LabelPrinterDict = {[key: string]: LabelPrinter};

export interface LabelPrintJob {
  id: number;
  scheduled_at: Date;
  barcode: string;
  labelsize: string;
  pdf: Buffer;
  status: LabelPrintJobStatus;
  name: string;
}

class LabelPrintQueueProcessor {
  working = false;
  printers: {[labelType: string]: LabelPrinter};

  constructor() {}

  get apiUrl() {
    return config.api.url;
  }

  get queueUrl() {
    return `${this.apiUrl}/labels_print_queue`;
  }

  async getPrinters(verbose=true) {
    /* Tell the user which printers were found. */
    if (verbose) {
      process.stdout.write('The following printers were found:\n');
    }
    return await (config.printers as LabelPrinter[])
      .reduce(async (pdict:LabelPrinterDict, printer:LabelPrinter) => {
        let cmd = `lpstat -p ${printer.printer}`;
        let res: ChildProcessResult;
        try {
          res = await async_exec(cmd) as ChildProcessResult;
        } catch(error) {
          res = error;
        }
        let msg = '';
        if (res.stdout.includes('enabled')) {
          msg = `Found and conencted.`;
          pdict = {...(await pdict), [printer.papersize]: printer};
        } else if (res.stderr.includes('Invalid destination')) {
          msg = `Unknown printer "${printer.printer}" -- skipping.`;
        } else if (res.stdout.includes('Unplugged or turned off')) {
          msg = 'Found but disconnected -- skipping.';
        } else if (res.code && res.code > 0) {
          msg = 'Error ${res.stderr} -- skipping.'
        } else {
          msg = 'Status unknown -- skipping.'
        }
        if (verbose) {
          process.stdout.write(`* ${printer.papersize} --> ${printer.title}\n`);
          process.stdout.write(`  - ${msg}\n`);
        }
        return (await pdict);
      }, {});
  }

  async updatePrinters() {
    let latest = await this.getPrinters(false);
    let latestNames = Object.entries(latest).map(
      ([papersize, printer]) => printer.title);
    let currentNames = Object.entries(this.printers).map(
      ([papersize, printer]) => printer.title);
    /* Report newly available printers. */
    let addedPrinters = latestNames.filter(p => p in currentNames);
    if (addedPrinters.length > 0) {
      process.stdout.write(`New printers available: ${addedPrinters.join(', ')}\n`);
    }
    /* Report removed printers. */
    let removedPrinters = currentNames.filter(p => p in latestNames);
    if (removedPrinters.length > 0) {
      process.stdout.write(`Printers now unavailable: ${removedPrinters.join(', ')}\n`);
    }
    if (addedPrinters.length > 0 || removedPrinters.length > 0) {
      this.printers = latest;
    }
  }

  async ping() {
    process.stdout.write('Checking server availability:');
    let pass = false;
    while (!pass) {
      await axios.get(`${this.apiUrl}`)
        .then(() => {
          process.stdout.write(' Done.\n');
          pass = true;
        })
        .catch(async (error) => {
          process.stdout.write('.');
          await new Promise(f => setTimeout(f, 5000));
        });
    }
  }

  async login() {
    console.log(`Logging into "${this.apiUrl}" with username "${config.api.username}".`);
    let data: any;
    try {
      data = (await axios.post(
        `${this.apiUrl}/authenticate`,
        {username: config.api.username, password: config.api.password, 'type': 'internal'}
      )).data;
    } catch (error) {
      if (error.response.status === 401) {
        console.error('  - Authentication with server failed. Wrong user/password.');
      } else {
        console.error(`  - Unkown error: ${error}`);
      }
      process.exit(1);
      return;
    }
    console.log(`  - Authentication successful.`);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  }

  async setStatus(job: LabelPrintJob, jobStatus: LabelPrintJobStatus) {
    const {data, status} = await axios.post(
      `${this.queueUrl}/${job.id}/status`,
      {'status': jobStatus}
    ).catch((error) => {
      console.error(`Could not set status of job ${job.id} to ${jobStatus}.`);
      process.exit(1);
    });
    job.status = jobStatus;
  }

  async claimNext(): Promise<LabelPrintJob|null> {
    let sizes = Object.keys(this.printers);
    const {data, status} = await axios.get(
      `${this.queueUrl}/next`,
      {
        params: {'sizes': sizes.join(','), timestamp: Date.now()},
        validateStatus: (status) => !(status in [200, 404]),
      }
    );
    if (status === 404) {
      return null;
    }
    /* Convert base64 PDF to Buffer. */
    data.pdf = Buffer.from(data.pdf, 'base64');
    let job = data as LabelPrintJob;
    await this.setStatus(job, 'processing' as LabelPrintJobStatus);
    return job;
  }

  async printLabel(printer: LabelPrinter, job: LabelPrintJob) {
    console.log(`Printing job ${job.id} to ${printer.title}`)
    let cmd = `lp -d ${printer.printer} `;
    for (let [name, value] of Object.entries(printer.options)) {
      cmd += `-o ${name}="${value}" `;
    }

    let tmpFile = tmp.fileSync();
    fs.appendFileSync(tmpFile.name, job.pdf);
    cmd += tmpFile.name;
    console.debug(`Running command: ${cmd}`)
    let res = await async_exec(cmd) as ChildProcessResult;
    if (res.code && res.code > 0) {
      console.error(res.stderr);
      throw new Error(`Print failed: ${res.stderr}`);
    }
  }

  async processJobs() {
    while (true) {
      let job = await this.claimNext()
      if (job === null) {
        break;
      }
      console.log(`Claimed job ${job.id}: ${job.name} for ${job.barcode}`)
      let printer = this.printers[job.labelsize]
      let status = null;
      try {
        await this.printLabel(printer, job);
        status = 'completed';
      } catch (error) {
        /* Printing does not involve network communication, so failures should just be
        /* reported to the server. */
        console.log(error)
        status = 'error';
      }
      this.setStatus(job, status as LabelPrintJobStatus);
    }
  }

  async process() {
    process.stdout.write('Listening for print jobs.\n');
        await this.updatePrinters();
        await this.processJobs();
    while (true) {
      try {
      } catch (error) {
        console.error(`Error while processing print jobs: ${error}`);
        console.error('Trying to recover...');
        await this.ping();
        continue;
      }
      await new Promise(f => setTimeout(f, 5000));
    }
  }

  async run() {
    this.printers = await this.getPrinters();
    await this.ping();
    await this.login();
    await this.process();
  }
}


let proc = new LabelPrintQueueProcessor()
proc.run();
