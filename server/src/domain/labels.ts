import * as fs from 'fs';
import config from 'config';
import { Font, Template, BLANK_PDF, generate } from '@pdfme/generator';
import {ExpressApp, HttpMethod} from '../common/express_app';
import { Item } from './items';
import { items, labelsPrintQueue } from './library';
import { LabelPrintJob } from './labels_print_queue';


interface ConfigFont {
  path: string,
  fallback?: boolean
}

interface ConfigFonts {
  [key: string]: ConfigFont
}

interface LabelParams {
  [key: string]: string|number|boolean
}

var fonts: Font = {};

Object.entries(config.get('fonts') as ConfigFonts).forEach(
  ([name, font], index) => {
    fonts[name] = {
      data: fs.readFileSync(font.path),
      fallback: font.fallback ? font.fallback : false,
    };
  }
);

interface Label {
  name: string;
  category: string;
  type: string;
  params: any[];
  isApplicable: Function;
  prepare: Function;
  template: Template;
}

export function getCategories(item: Item): string[] {
  const labels = config.get('labels') as Label[];
  return labels
    .filter((label, idx, labels) => label.isApplicable(item))
    .map(label => label.category)
}

export function findLabel(category: string, item: Item): Label {
  const labels = config.get('labels') as Label[];
  for (var label of labels) {
    if (label.category === category && label.isApplicable(item))
      return label;
  }
  throw new Error(`No label found for "${category}" and item "${item.barcode}".`);
}

export async function generateLabel(
  category: string,
  item: Item,
  params?: LabelParams
): Promise<Uint8Array> {
  let label = findLabel(category, item);
  let inputs = label.prepare(item, params);
  let pdf = fs.readFileSync(label.template.basePdf as string, {encoding: 'binary'});
  let buff = Buffer.from(pdf);
  // I could not make it work other than converting it to base64. (SR)
  let pdf64 = 'data:application/pdf;base64,'+buff.toString('base64')
  return generate({
    template: Object.assign(
      JSON.parse(JSON.stringify(label.template)), {basePdf: pdf64}),
    inputs: [inputs],
    options: {font: fonts},
  });
}

export async function printLabel(
  category: string,
  item: Item,
  params?: LabelParams
): Promise<LabelPrintJob> {
  let pdf = await generateLabel(category, item, params);
  let label = findLabel(category, item);
  let job = labelsPrintQueue.create({
    barcode: item.barcode,
    labelsize: label.type,
    pdf: pdf,
    name: label.name,
  } as LabelPrintJob)
  return job;
}

export function initRoutes(application: ExpressApp) {
  application.addHandler({
    method: HttpMethod.GET,
    path: `/api/items/:key/labels/categories`,
    handle: async (req, res) => {
      const barcode = req.params['key'];
      const item = await items.get(barcode)
      res.send({categories: getCategories(item)});
    },
    authAction: {resource: 'items', operation: 'read'},
  });
  application.addHandler({
    method: HttpMethod.GET,
    path: `/api/items/:key/labels/:category/fields`,
    handle: async (req, res) => {
      let barcode = req.params['key'];
      let item = await items.get(barcode)
      let category = req.params['category'];
      let label = findLabel(category, item);
      res.send({
        category: category,
        fields: label.params !== undefined ? label.params : [],
      });
    },
    authAction: {resource: 'items', operation: 'read'},
  });
  application.addHandler({
    method: HttpMethod.POST,
    path: `/api/items/:key/labels/:category/preview`,
    handle: async (req, res) => {
      let barcode = req.params['key'];
      let item = await items.get(barcode)
      let category = req.params['category'];
      let data = req.body;
      let pdf = await generateLabel(category, item, data);
      let buffer = Buffer.from(pdf)
      res.setHeader('Content-Length', pdf.length);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=preview.pdf');
      res.send(buffer);
    },
    authAction: {resource: 'items', operation: 'read'},
  });
  application.addHandler({
    method: HttpMethod.POST,
    path: `/api/items/:key/labels/:category/print`,
    handle: async (req, res) => {
      let barcode = req.params['key'];
      let item = await items.get(barcode)
      let category = req.params['category'];
      let data = req.body;
      let job = await printLabel(category, item, data);
      res.send({jobId: job.id});
    },
    authAction: {resource: 'items', operation: 'read'},
  });

}
