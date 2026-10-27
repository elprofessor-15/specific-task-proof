import { execFileSync } from "node:child_process";
for (const file of [
  "server.mjs",
  "app.js",
  "src/proof.mjs",
  "fixtures/billing.mjs",
  "fixtures/run.mjs",
])
  execFileSync(process.execPath, ["--check", file]);
console.log("All application modules parse. Buildless app ready.");
