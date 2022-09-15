import * as express from 'express';
import axios from 'axios';
import multer from 'multer';
import { parse } from 'csv-parse';
import { db, borrowers } from './library';
import { Borrower } from './borrowers';

const ANTOLIN_DATABASE_URL = 'https://antolin.westermann.de/all/downloads/antolingesamt-utf8.csv';

const ANTOLIN_COLUMNS = [
  'author', 'title', 'publisher', 'isbn10', 'since', 'grade', 'read',
  'isbn13', 'isbn10f', 'isbn13f', 'bookid'
];

const ANTOLIN_CLEAR_SQL = 'DELETE FROM antolin';

const ANTOLIN_INSERT_SQL = (
  'INSERT INTO antolin ' +
  '(author, title, publisher, isbn10, isbn10_formatted, isbn13, ' +
  ' isbn13_formatted, book_id, available_since, grade, num_read) ' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

const ANTOLIN_LINK_TO_ITEMS_SQL = (
  'UPDATE items, antolin ' +
  'SET items.antolin = antolin.book_id ' +
  'WHERE ' +
  '  (items.isbn10 IS NOT NULL and items.isbn10 = antolin.isbn10) ' +
  '  OR ' +
  '  (items.isbn13 IS NOT NULL and items.isbn13 = antolin.isbn13) '
);


interface AntolinSyncResult {
  books: number;
}

interface FamilyLoadResult {
  created: number;
  updated: number;
}

const upload = multer()

export async function syncAntolin(): Promise<AntolinSyncResult> {
  // XXX: Could be converted to streaming read and parse.
  const {data, status} = await axios.get(ANTOLIN_DATABASE_URL)
  await db.execute(ANTOLIN_CLEAR_SQL);
  const parser = parse(
    data,
    {
      delimiter: ';',
      escape: '"',
      columns: ANTOLIN_COLUMNS,
      fromLine: 2,
      encoding: 'utf-8',
    }
  );
  var seen: string[] = [];
  var duplicates = 0;
  for await (const row of parser) {
    // Some entries are bad.
    if (row.isbn13.length != 13)
      continue;
    if (row.isbn13f.length != 17) {
      row.isbn13f = null;
    }
    if (row.isbn10.length != 10) {
      row.isbn10 = null;
    }
    if (row.isbn10f.length != 13) {
      row.isbn10f = null;
    }

    if (row.isbn13 in seen) {
      duplicates += 1
      continue;
    }
    seen.push(row.isbn13)

    const pieces = row.since.split('.').map((p:string) => +p);
    await db.execute(
      ANTOLIN_INSERT_SQL,
      [
        row.author, row.title, row.publisher, row.isbn10, row.isbn10f, row.isbn13,
        row.isbn13f, +row.bookid, new Date(pieces[2], pieces[1], pieces[0]),
        row.grade, +row.read
      ]
    );
  }
  await db.execute(ANTOLIN_LINK_TO_ITEMS_SQL);
  return {books: seen.length};
}

async function loadFamilies(report: string): Promise<FamilyLoadResult> {
  const parser = parse(
    report,
    {
      delimiter: ',',
      escape: '"',
      columns: [
        'code','family_name','phone','family_email','last_name','first_name',
        'student_email'
      ],
      fromLine: 2,
      encoding: 'utf-8',
    }
  );

  let families: { [code: string]: Borrower} = {};
  for await (const row of parser) {
    if (row.code in families) {
      families[row.code].firstname += ',' + row.first_name;
      continue;
    }
    families[row.code] = {
      surname: row.last_name,
      firstname: row.first_name,
      contactname: row.family_name,
      phone: row.phone.split('|')[0].trim(),
      emailaddress: row.family_email.split('|').map((e: string) => e.trim()).join(', '),
      sycamoreid: row.code,
      state: 'ACTIVE',
    } as Borrower;
  }

  let created = 0;
  let updated = 0;
  for (const [code, borrower] of Object.entries(families)) {
    /* Make the list of first names look nice */
    let names = borrower.firstname.split(',');
    borrower.firstname = names.concat(names.splice(-2, 2).join(' and ')).join(', ');

    let storedBorrower = await borrowers.find({fields: {sycamoreid: code}});
    if (!storedBorrower) {
      /* A new borrower has to be created. */
      borrowers.create(borrower);
      created += 1;
    } else {
      borrower.id = storedBorrower.id;
      borrowers.update(borrower);
      updated += 1;
    }
  }
  return {updated, created}
}


export function initRoutes(app: express.Application): void {
  app.post('/api/admin/antolin/sync', async (req, res) => {
    const result = await syncAntolin();
    res.send(result);
  })
  app.post(
    '/api/admin/families/load',
    upload.fields([{name: 'report'}]),
    async (req, res) => {
      if (req.files === undefined || !('report' in req.files)) {
        res.status(400);
        res.send('No report file found.');
        return;
      }
      const result = await loadFamilies(req.files['report'][0].buffer.toString())
      res.send(result);
    })
}
