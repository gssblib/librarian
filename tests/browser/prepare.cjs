const { execFileSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const root = path.resolve(__dirname, "../..");
const frontendNode = process.env.E2E_FRONTEND_NODE || process.execPath;
const env = { ...process.env, NG_CLI_ANALYTICS: "false" };
for (const key of [
  "NODE_ENV",
  "NODE_CONFIG",
  "NODE_CONFIG_DIR",
  "NODE_CONFIG_ENV",
  "NODE_APP_INSTANCE",
  "NODE_OPTIONS",
])
  delete env[key];
function run(binary, args, cwd) {
  execFileSync(binary, args, {
    cwd: path.join(root, cwd),
    env,
    stdio: "inherit",
  });
}
for (const dir of ["client", "server"]) {
  if (!fs.existsSync(path.join(root, dir, "node_modules")))
    throw Error(
      `Install ${dir} dependencies first; see tests/browser/README.md.`,
    );
}
// Compile the unchanged backend and both real production frontends.
run(process.execPath, ["node_modules/typescript/bin/tsc"], "server");
for (const project of ["client", "public"]) {
  run(
    frontendNode,
    [
      "node_modules/@angular/cli/bin/ng.js",
      "build",
      project,
      "--configuration",
      "production",
    ],
    "client",
  );
}
