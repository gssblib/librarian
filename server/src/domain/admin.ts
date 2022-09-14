import * as express from 'express';
import axios from 'axios';
import { parse } from 'csv-parse';
import { db } from './library';

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

async function syncAntolin(): Promise<AntolinSyncResult> {
  // XXX: Could be converted to streaming read and parse.
  const {data, status} = await axios.get(ANTOLIN_DATABASE_URL)
  await db.execute(ANTOLIN_CLEAR_SQL);
  const parser = parse(
    data,
    {
      delimiter: ';',
      escape: '"',
      columns: ANTOLIN_COLUMNS,
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


export function initRoutes(app: express.Application): void {
  app.post('/api/admin/antolin/sync', async (req, res) => {
    const result = await syncAntolin()
    res.send(result);
  })
}
