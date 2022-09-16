import { Injectable } from '@angular/core';
import { RpcService } from "../core/rpc.service";
import { ModelService } from "../core/model.service";
import { LabelPrintJob } from './labels-print-queue';
import { LabelsPrintQueueService } from "./labels-print-queue.service";
import { Observable } from "rxjs";

/**
 * Manages the single print job whose information is shown in the print job views.
 *
 * All prot job views watch the observable in this service, and changes to the print job
 * (reloading the data from the server) are published to this service.
 */
@Injectable()
export class LabelPrintJobService extends ModelService<LabelPrintJob> {

  constructor(private rpc: RpcService, private queueService: LabelsPrintQueueService) {
    super(queueService);
  }

}
