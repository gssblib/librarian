import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { RpcService } from '../core/rpc.service';
import { FormService } from '../core/form.service';
import { ModelsService } from "../core/models.service";
import { LabelPrintJob } from './labels-print-queue';


@Injectable()
export class LabelsPrintQueueService extends ModelsService<LabelPrintJob> {

  constructor(rpc: RpcService, formService: FormService) {
    super('labels_print_queue', job => job.id, rpc, formService);
  }

  private arrayBufferToBase64(buffer) {
    console.log(buffer);
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  toModel(row: any): LabelPrintJob {
    return Object.assign(new LabelPrintJob(), row);
  }

  getLabelPdf(job: LabelPrintJob): Observable<any> {
    return this.rpc.httpGet(
      `labels_print_queue/${job.id}/pdf`,
      {},
      {responseType: 'arraybuffer'}
    )
      .pipe(map(pdf => this.arrayBufferToBase64(pdf)));
  }

  clear(): Observable<any> {
    return this.rpc.httpPost('labels_print_queue/clear');
  }

}
