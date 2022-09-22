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

type LabelPrinterList = {[key: string]: LabelPrinter};

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

  constructor() {
    let confPrinters = config.printers as LabelPrinter[];
    this.printers = confPrinters
      .reduce((a:LabelPrinterList, v:LabelPrinter) => ({...a, [v.papersize]: v}), {});
    /* Tell the user which printers were found. */
    process.stdout.write('The following printers were found:\n');
    for (let [key, printer] of Object.entries(this.printers)) {
      process.stdout.write(`* ${key} --> ${printer.title}\n`);
    }
  }

  get apiUrl() {
    return config.api.url;
  }

  get queueUrl() {
    return `${this.apiUrl}/labels_print_queue`;
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
    while (true) {
      try {
        await this.processJobs()
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
    await this.ping();
    await this.login();
    await this.process();
  }
}


let proc = new LabelPrintQueueProcessor()
proc.run();
