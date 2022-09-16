"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const util = __importStar(require("util"));
const config = __importStar(require("config"));
const mysql = __importStar(require("mysql2/promise"));
const cron_1 = require("cron");
const tmp = __importStar(require("tmp"));
const child_process = __importStar(require("child_process"));
const pool = mysql.createPool(config.get('db'));
const async_exec = util.promisify(child_process.exec);
class LabelPrintQueueProcessor {
    constructor() {
        this.working = false;
        let confPrinters = config.get('printers');
        this.printers = confPrinters
            .reduce((a, v) => (Object.assign(Object.assign({}, a), { [v.papersize]: v })), {});
        /* Tell the user which printers were found. */
        process.stdout.write('The following printers were found:\n');
        for (let [key, printer] of Object.entries(this.printers)) {
            process.stdout.write(`* ${key} --> ${printer.title}\n`);
        }
    }
    setStatus(job, status) {
        return __awaiter(this, void 0, void 0, function* () {
            pool.execute("UPDATE labels_print_queue SET status = ? WHERE id = ?", [status, job.id]);
            job.status = status;
        });
    }
    claimNext() {
        return __awaiter(this, void 0, void 0, function* () {
            let rows = yield pool.query("SELECT * FROM labels_print_queue " +
                "WHERE labelsize IN (?) AND status = 'waiting' " +
                "ORDER BY id " +
                "LIMIT 1", [Object.keys(this.printers)]);
            if (rows[0].length == 0 || rows[0][0].length == 0) {
                return null;
            }
            console.log(rows[0][0]);
            let job = rows[0][0];
            yield this.setStatus(job, 'processing');
            return job;
        });
    }
    printLabel(printer, job) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Printing job ${job.id} to ${printer.title}`);
            let cmd = (`lp -d ${printer.printer} ` +
                /* Make sure we are printing in high-quality mode, so that
                   graphics, especially barcodes are printed in sufficiant detail. */
                '-o DymoPrintQuality=Graphics ' +
                '-o Resolution=300x600dpi ');
            for (let [name, value] of Object.entries(printer.options)) {
                cmd += `-o ${name}="${value} `;
            }
            let tmpFile = tmp.fileSync();
            fs.appendFileSync(tmpFile.name, job.pdf);
            cmd += tmpFile.name;
            console.debug(`Running command: ${cmd}`);
            let res = yield async_exec(cmd);
            console.debug(res);
            if (res.code && res.code > 0) {
                console.error(res.stderr);
                throw new Error(`Print failed: ${res.stderr}`);
            }
        });
    }
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                let job = yield this.claimNext();
                if (job === null) {
                    break;
                }
                console.log(`Claimed job ${job.id}: ${job.name} for ${job.barcode}`);
                let printer = this.printers[job.labelsize];
                let status = null;
                try {
                    yield this.printLabel(printer, job);
                    status = 'completed';
                }
                catch (error) {
                    console.log(error);
                    status = 'error';
                }
                this.setStatus(job, status);
            }
        });
    }
    safeProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.working) {
                return;
            }
            this.working = true;
            try {
                yield this.process();
            }
            catch (error) {
                console.error(error);
            }
            this.working = false;
        });
    }
    run() {
        let job = new cron_1.CronJob('* * * * * *', this.safeProcess, null, false, 'UTC', this);
        job.start();
    }
}
let proc = new LabelPrintQueueProcessor();
proc.run();
