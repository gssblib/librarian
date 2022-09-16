import * as fs from 'fs';
import * as util from 'util';
import * as conf from 'config';
import * as mysql from 'mysql2/promise';
import {CronJob} from 'cron';
import * as tmp from 'tmp';
import * as child_process from 'child_process';

const config = conf as any;
const pool = mysql.createPool(config.db);
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

  async setStatus(job: LabelPrintJob, status: LabelPrintJobStatus) {
    pool.execute(
      "UPDATE labels_print_queue SET status = ? WHERE id = ?",
      [status, job.id]
    );
    job.status = status;
  }

  async claimNext(): Promise<LabelPrintJob|null> {
    let rows = await pool.query(
      "SELECT * FROM labels_print_queue " +
        "WHERE labelsize IN (?) AND status = 'waiting' " +
        "ORDER BY id " +
        "LIMIT 1",
      [Object.keys(this.printers)]
    ) as mysql.RowDataPacket[][];
    if (rows[0].length == 0 || rows[0][0].length == 0) {
      return null;
    }
    console.log(rows[0][0]);
    let job = rows[0][0] as LabelPrintJob;
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
      cmd += `-o ${name}="${value} `;
    }

    let tmpFile = tmp.fileSync();
    fs.appendFileSync(tmpFile.name, job.pdf);
    cmd += tmpFile.name;
    console.debug(`Running command: ${cmd}`)
    let res = await async_exec(cmd) as ChildProcessResult;
    console.debug(res);
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

  run() {
    let job = new CronJob(
      '* * * * * *', this.safeProcess, null, false, 'UTC', this);
    job.start()
  }
}


let proc = new LabelPrintQueueProcessor()
proc.run();
