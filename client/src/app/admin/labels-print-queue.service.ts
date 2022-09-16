import { Injectable } from '@angular/core';
import { RpcService } from '../core/rpc.service';
import { FormService } from '../core/form.service';
import { ModelsService } from "../core/models.service";
import { LabelPrintJob } from './labels-print-queue';


@Injectable()
export class LabelsPrintQueueService extends ModelsService<LabelPrintJob> {

  constructor(rpc: RpcService, formService: FormService) {
    super('labels_print_queue', job => job.id, rpc, formService);
  }

  toModel(row: any): LabelPrintJob {
    return Object.assign(new LabelPrintJob(), row);
  }
}
