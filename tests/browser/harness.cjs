// Test-only host. Never imported by the application or included in a Functions deploy.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const http = require("node:http");
const { spawn, execFileSync } = require("node:child_process");
const { createRequire } = require("node:module");
const { randomUUID } = require("node:crypto");
const root = path.resolve(__dirname, "../..");
const requireServer = createRequire(path.join(root, "server/package.json"));
const ADMIN_PORT = 4242,
  PUBLIC_PORT = 4243;
const token = randomUUID();
const salt = randomUUID();
process.umask(0o077);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "librarian-e2e-"));
const socketPath = path.join(tmp, "mysql.sock");
const stateFile = path.join(__dirname, ".run.json");
let mysqld,
  db,
  appPool,
  stopping = false;
const servers = [];

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const server of servers) {
    server.closeAllConnections();
    server.close();
  }
  await appPool?.end().catch(() => {});
  await db?.end().catch(() => {});
  if (mysqld && mysqld.exitCode === null) {
    mysqld.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => mysqld.once("exit", resolve)),
      new Promise((resolve) => setTimeout(resolve, 10000)),
    ]);
    if (mysqld.exitCode === null) {
      mysqld.kill("SIGKILL");
      await new Promise((resolve) => mysqld.once("exit", resolve));
    }
  }
  if (
    fs.existsSync(stateFile) &&
    JSON.parse(fs.readFileSync(stateFile)).token === token
  )
    fs.unlinkSync(stateFile);
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(code);
}
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => stop());

async function main() {
  // Claim ports first: never attach to an existing QA or production proxy.
  for (const port of [ADMIN_PORT, PUBLIC_PORT]) {
    const server = http.createServer((_req, res) =>
      res.writeHead(503).end("Starting disposable test environment"),
    );
    await new Promise((resolve, reject) =>
      server.once("error", reject).listen(port, "127.0.0.1", resolve),
    );
    servers.push(server);
  }
  let binary = process.env.E2E_MYSQLD;
  if (!binary)
    binary = [
      "/opt/homebrew/opt/mysql@8.4/bin/mysqld",
      "/usr/sbin/mysqld",
      "/usr/bin/mysqld",
    ].find(fs.existsSync);
  if (!binary)
    throw Error(
      "MySQL 8.4 is required; set E2E_MYSQLD to its mysqld executable.",
    );
  if (
    !/Ver 8\.4\./.test(
      execFileSync(binary, ["--version"], { encoding: "utf8" }),
    )
  )
    throw Error("Use MySQL 8.4 for the disposable test database.");
  const datadir = path.join(tmp, "mysql");
  const base = path.dirname(path.dirname(fs.realpathSync(binary)));
  const args = ["--no-defaults", `--basedir=${base}`, `--datadir=${datadir}`];
  execFileSync(binary, [...args, "--initialize-insecure"], {
    stdio: ["ignore", "ignore", "pipe"],
    timeout: 60000,
  });
  const mysqlLog = fs.openSync(path.join(tmp, "mysql.log"), "a");
  mysqld = spawn(
    binary,
    [
      ...args,
      `--socket=${socketPath}`,
      "--skip-networking",
      "--mysqlx=OFF",
      "--local-infile=OFF",
      "--event-scheduler=OFF",
    ],
    { stdio: ["ignore", mysqlLog, mysqlLog] },
  );
  fs.closeSync(mysqlLog);
  const mysql = requireServer("mysql2/promise");
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      db = await mysql.createConnection({
        socketPath,
        user: "root",
        multipleStatements: true,
      });
      break;
    } catch {
      if (mysqld.exitCode !== null)
        throw Error(
          "Test mysqld exited: " +
            fs.readFileSync(path.join(tmp, "mysql.log"), "utf8"),
        );
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  if (!db) throw Error("Test MySQL did not become ready.");
  await db.query("CREATE DATABASE librarian_e2e CHARACTER SET utf8mb4");
  await db.query("USE librarian_e2e");
  await db.query(fs.readFileSync(path.join(root, "sql/schema.sql"), "utf8"));
  // Checked-in schema predates this field; production and the app already use it.
  await db.query("ALTER TABLE items ADD COLUMN category TEXT");
  const seed = require("./seed.cjs");
  await seed(db, salt);

  for (const key of [
    "NODE_CONFIG",
    "NODE_CONFIG_ENV",
    "NODE_APP_INSTANCE",
    "NODE_OPTIONS",
  ])
    delete process.env[key];
  process.env.NODE_ENV = "e2e";
  process.env.NODE_CONFIG_DIR = path.join(tmp, "config");
  fs.mkdirSync(process.env.NODE_CONFIG_DIR);
  fs.writeFileSync(
    path.join(process.env.NODE_CONFIG_DIR, "default.js"),
    `module.exports=require(${JSON.stringify(path.join(root, "server/config/default.js"))});`,
  );
  fs.writeFileSync(
    path.join(process.env.NODE_CONFIG_DIR, "e2e.json"),
    JSON.stringify({
      db: { database: "librarian_e2e", socketPath, user: "root" },
      auth: { salt, cookie: randomUUID(), session: randomUUID() },
      jwt: { secret: randomUUID() },
      smtp: {
        fake: true,
        host: "127.0.0.1",
        port: 1,
        user: "test@example.invalid",
        password: "",
      },
      email: {
        sender: "test@example.invalid",
        reply_to: "test@example.invalid",
      },
      "sycamore-auth": { url: `http://127.0.0.1:${ADMIN_PORT}/__e2e/sycamore` },
      logging: { level: "error" },
    }),
  );
  const connect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    let options = Array.isArray(args[0]) ? args[0][0] : args[0];
    if (typeof options === "string" && !/^\d+$/.test(options))
      options = { path: options };
    else if (typeof options !== "object")
      options = {
        port: options,
        host: typeof args[1] === "string" ? args[1] : "localhost",
      };
    const allowed = options.path
      ? options.path === socketPath
      : options.host === "127.0.0.1" && Number(options.port) === ADMIN_PORT;
    if (!allowed) throw Error("Test harness blocked outbound connection");
    return connect.apply(this, args);
  };
  // No SMTP connection or delivery, even if application startup verifies a transport.
  requireServer("nodemailer").createTransport = () => ({
    verify: (cb) => cb(null, true),
    sendMail: async () => {
      throw Error("SMTP delivery disabled in browser tests");
    },
  });
  const express = requireServer("express");
  const api = require(path.join(root, "server/lib/server")).app;
  appPool = require(path.join(root, "server/lib/domain/library")).pool;
  const config = requireServer("config");
  if (
    config.get("db.database") !== "librarian_e2e" ||
    config.get("db.socketPath") !== socketPath ||
    config.has("db.host")
  )
    throw Error("Unexpected test configuration");
  let ready = false;
  for (const [port, folder] of [
    [ADMIN_PORT, "dist"],
    [PUBLIC_PORT, "dist-public"],
  ]) {
    const app = express();
    app.get("/__e2e/ready", (_req, res) =>
      res
        .status(ready ? 200 : 503)
        .json({ environment: "disposable-browser-test" }),
    );
    app.post("/__e2e/reset", async (req, res, next) => {
      if (req.get("x-e2e-token") !== token) return res.sendStatus(403);
      try {
        await seed(db, salt);
        res.sendStatus(204);
      } catch (e) {
        next(e);
      }
    });
    app.post(
      "/__e2e/sycamore",
      express.urlencoded({ extended: false }),
      (req, res) => {
        const valid =
          req.body.entered_login === "test-family" &&
          req.body.entered_password === "family-password" &&
          req.body.entered_schid === "2132";
        res
          .type("html")
          .send(valid ? "schoolhome.php" : "Invalid school login");
      },
    );
    app.use(api);
    app.use("/api", (_req, res) =>
      res.status(404).json({ error: "Not found" }),
    );
    app.use(express.static(path.join(root, "client", folder)));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(root, "client", folder, "index.html")),
    );
    const server = servers[port === ADMIN_PORT ? 0 : 1];
    server.removeAllListeners("request");
    server.on("request", app);
  }
  fs.writeFileSync(
    stateFile,
    JSON.stringify({ token, environment: "disposable-browser-test" }),
    { mode: 0o600 },
  );
  ready = true;
  process.stdout.write(
    "Browser tests ready: local production builds, fresh fictional database, outbound network blocked.\n",
  );
}
main().catch(async (error) => {
  console.error(error);
  await stop(1);
});
