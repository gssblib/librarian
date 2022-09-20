import { items } from './domain/library';
import { generateLabel } from './domain/labels';

async function main() {
  let bad = []
  let barcodes = (await items.db.query('SELECT barcode FROM items'))
    .map(row => row.barcode);
  for (let barcode of barcodes) {
    const row = await items.db.selectRow(
      'SELECT * FROM items WHERE barcode = ?', [barcode]);
    if (!row) {
      continue;
    }
    let item = await items.table.fromDb(row);
    try {
      await generateLabel('main', item, {});
    }
    catch (error) {
      bad.push({item, error});
    }
  }
  console.log('Items without available "main" label:');
  for (let {item, error} of bad) {
    console.log(`- ${item.barcode} (${error})`);
  }

}

main();
