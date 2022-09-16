import { BaseEntity } from '../common/base_entity';
import { EnumColumnDomain } from '../common/column';
import { Db } from '../common/db';
import { ExpressApp, HttpMethod } from '../common/express_app';
import { EntityTable } from '../common/table';
import { saltedHash } from './login';

type LabelPrintJobStatus = 'waiting'|'processing'|'completed';

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
      internal: true,
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

  override initRoutes(application: ExpressApp): void {

    super.initRoutes(application);
  }

}
