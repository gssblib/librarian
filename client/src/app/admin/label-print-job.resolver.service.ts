import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LabelPrintJob } from './labels-print-queue';
import { Injectable } from '@angular/core';
import { LabelsPrintQueueService } from './labels-print-queue.service';

@Injectable()
export class LabelPrintJobResolverService implements Resolve<LabelPrintJob> {
  constructor(private queueService: LabelsPrintQueueService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LabelPrintJob> {
    const id = route.params['id'];
    return this.queueService.get(id);
  }
}
