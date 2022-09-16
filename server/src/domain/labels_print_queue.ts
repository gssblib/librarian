import { BaseEntity } from '../common/base_entity';
import { EnumColumnDomain } from '../common/column';
import { Db } from '../common/db';
import { ExpressApp, HttpMethod } from '../common/express_app';
import { EntityTable } from '../common/table';
import { saltedHash } from './login';

type LabelPrintJobStatus = 'waiting'|'processing'|'completed'|'error';

export interface LabelPrintJob {
  /** Auto-generated id. */
  id: number;

  /** Scheduled Date/Time of the Job (automatically assigned). */
  scheduled_at: Date;

  /** Barcode of the item for which the label is created. */
  barcode: string;

  /** The size of the label. Determines printer to be used. */
  labelsize: string;

  /** The PDF file to be printed */
  pdf: Buffer;

  /** The status of the print job. */
  status: LabelPrintJobStatus;

  /** The name of the label. */
  name: string;
}

const LabelPrintJobStatusDomain = new EnumColumnDomain<LabelPrintJobStatus>([
  'waiting',
  'processing',
  'completed',
  'error',
]);

export class LabelsPrintQueueTable extends EntityTable<LabelPrintJob> {
  constructor() {
    super({
      name: 'labels_print_queue',
    });
    this.addColumn({
      name: 'id',
      internal: true,
    });
    this.addColumn({
      name: 'scheduled_at',
    });
    this.addColumn({
      name: 'barcode',
      label: 'Item Barcode',
      queryOp: 'contains',
    });
    this.addColumn({
      name: 'labelsize',
      label: 'Label Size',
    });
    this.addColumn({
      name: 'pdf',
      label: 'PDF Content',
      internal: true,
    });
    this.addColumn({
      name: 'status',
      label: 'Status',
      domain: LabelPrintJobStatusDomain,
    });
    this.addColumn({
      name: 'name',
      label: 'Label Name',
    });
  }
}

export const labelsPrintQueueTable = new LabelsPrintQueueTable();

export class LabelsPrintQueue extends BaseEntity<LabelPrintJob> {
  constructor(db: Db) {
    super(db, labelsPrintQueueTable);
  }

  protected toKeyFields(key: string): Partial<LabelPrintJob> {
    return {id: parseInt(key, 10)};
  }

  override update(obj: Partial<LabelPrintJob>): Promise<LabelPrintJob|undefined> {
    /* Never update the pdf. */
    if (obj.pdf) {
      obj.pdf = undefined;
    }
    if (typeof obj.scheduled_at === 'string') {
      obj.scheduled_at = new Date(Date.parse(obj.scheduled_at));
    }
    return super.update(obj);
  }

  override initRoutes(application: ExpressApp): void {
    application.addHandler({
      method: HttpMethod.GET,
      path: `${this.keyPath}/pdf`,
      handle: async (req, res) => {
        let id = req.params['key'];
        let job = await this.get(id)
        let buffer = Buffer.from(job.pdf)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=label.pdf');
        res.send(buffer);
      },
      authAction: {resource: 'labels_print_queue', operation: 'read'},
    });
    super.initRoutes(application);
  }

}
