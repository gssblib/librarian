
export enum LabelPrintJobStatus {
  waiting = 'waiting',
  processing = 'processing',
  completed = 'completed',
}

export class LabelPrintJob {
  id: number;
  scheduled_at: Date;
  barcode: string;
  labelsize: string;
  status: LabelPrintJobStatus;
  name: string;
}
