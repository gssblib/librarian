import mimetypes
import os
import pymysql

conn = pymysql.connect(
    user='root',
    password='vEyoNCj3H5z73rw2',
    database='spils',
    host='localhost',
    port=3307,
)
cur = conn.cursor()

coversDir = './covers'

for fn in os.listdir(coversDir):
    fpath = os.path.join(coversDir, fn)
    barcode = fn.split('.')[0]
    print(f'Processing {barcode}');
    with open(fpath, 'rb') as fp:
        cur.execute(
            'INSERT INTO item_covers (barcode, mimetype, image) VALUES (%s, %s, %s)',
            (barcode, mimetypes.guess_type(fpath)[0], fp.read())
        )
        conn.commit()

conn.close()
