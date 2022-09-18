import axios from 'axios';
import * as fs from 'fs';
import * as util from 'util';
import * as conf from 'config';
import {CronJob} from 'cron';
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

  async login() {
    console.log(`Logging into "${this.apiUrl}" with username "${config.api.username}".`);
    const {data, status} = await axios.post(
      `${this.apiUrl}/authenticate`,
      {username: config.api.username, password: config.api.password, 'type': 'internal'}
    )
    if (status !== 200) {
      console.error('Authentication with server failed.');
      process.exit(1);
    }
    console.log(`Authentication successful.`);
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
        params: {'sizes': sizes.join(',')},
        validateStatus: (status) => !(status in [200, 404]),
      }
    ).catch((error) => {
      console.error(`Bad server response while claiming job: ${error}`);
      process.exit(1);
    });
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
    let cmd = (
      `lp -d ${printer.printer} ` +
        /* Make sure we are printing in high-quality mode, so that
           graphics, especially barcodes are printed in sufficiant detail. */
        '-o DymoPrintQuality=Graphics ' +
        '-o Resolution=300x600dpi '
     )
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

  async process() {
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
        console.log(error)
        status = 'error';
      }
      this.setStatus(job, status as LabelPrintJobStatus);
    }
  }

  async safeProcess() {
    if (this.working) {
      return;
    }
    this.working = true;
    try {
      await this.process()
    } catch (error) {
      console.error(error);
    }
    this.working = false;
  }

  async run() {
    await this.login();
    let job = new CronJob(
      '* * * * * *', this.safeProcess, null, false, 'UTC', this);
    job.start()
  }
}


let proc = new LabelPrintQueueProcessor()
proc.run();
