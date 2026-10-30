const { createHash } = require("node:crypto");
const tables = [
  "borrower_emails",
  "order_items",
  "orders",
  "order_cycles",
  "issue_history",
  "latefee",
  "out",
  "item_covers",
  "labels_print_queue",
  "items",
  "borrowers",
  "users",
  "antolin",
];

module.exports = async function seed(db, salt) {
  // This connection belongs only to the freshly initialized test mysqld.
  await db.query("SET FOREIGN_KEY_CHECKS=0");
  for (const name of tables) await db.query(`TRUNCATE TABLE \`${name}\``);
  await db.query("SET FOREIGN_KEY_CHECKS=1");
  const hash = createHash("sha256")
    .update(salt + "test-password")
    .digest("hex");
  await db.execute(
    "INSERT INTO users (username, hashed_password, roles, failed_login_attempts) VALUES (?, ?, ?, 0)",
    ["test-admin", hash, "admin,librarian,clerk"],
  );
  await db.query(`INSERT INTO borrowers (borrowernumber,surname,firstname,contactname,emailaddress,state,sycamoreid) VALUES
    (90001,'Beispiel','Ada','Fictional Family One','one@example.invalid','ACTIVE','test-family'),
    (90002,'Muster','Ben','Fictional Family Two','two@example.invalid','ACTIVE','other-family')`);
  for (let i = 1; i <= 14; i++) {
    await db.execute(
      `INSERT INTO items (barcode,category,title,author,subject,age,publisher,publicationyear,seriestitle,itemnotes,replacementprice,added,state)
      VALUES (?, 'Buch', ?, ?, 'Bilderbuch B - gelb', 'K-1', 'Fictional Publisher', 2026, 'Test series', 'Fictional browser fixture', 12, '2026-01-01', 'CIRCULATING')`,
      [
        String(900000000 + i),
        `Test Book ${String(i).padStart(2, "0")}`,
        i % 2 ? "Ada Beispiel" : "Ben Muster",
      ],
    );
  }
  // A real, tiny cover exercises the image endpoint without external requests.
  await db.execute(
    "INSERT INTO item_covers (barcode,mimetype,image) VALUES (?, ?, ?)",
    [
      "900000001",
      "image/png",
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT1sAAAAASUVORK5CYII=",
        "base64",
      ),
    ],
  );
  await db.query(`INSERT INTO \`out\` (barcode,borrowernumber,checkout_date,date_due,renewals)
    VALUES ('900000014',90001,DATE_SUB(NOW(),INTERVAL 7 DAY),DATE_ADD(CURDATE(),INTERVAL 7 DAY),0)`);
  await db.query(`INSERT INTO order_cycles (order_window_start,order_window_end)
    VALUES (DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_ADD(NOW(),INTERVAL 7 DAY))`);
  await db.execute(
    "INSERT INTO labels_print_queue (barcode,labelsize,pdf,status,name) VALUES (?,?,?,?,?)",
    [
      "900000001",
      "small",
      require("./fixture-pdf.cjs")(),
      "DONE",
      "Fictional test label",
    ],
  );
};
