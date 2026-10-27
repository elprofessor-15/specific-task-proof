import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
const exec = promisify(execFile);
const runner = new URL("../fixtures/run.mjs", import.meta.url);
export const variants = [
  {
    id: "baseline",
    name: "Unchanged baseline",
    expect: "reject",
    reason: "Bills every seat for the entire month.",
  },
  {
    id: "reference",
    name: "Reference solution",
    expect: "accept",
    reason: "Clips active dates to the invoice period; rounds once.",
  },
  {
    id: "ignores-cancellation",
    name: "Mutation · cancellation",
    expect: "reject",
    reason: "Handles activation but bills past cancellation.",
  },
  {
    id: "rounds-early",
    name: "Mutation · rounding",
    expect: "reject",
    reason: "Rounds the daily rate before multiplying active days.",
  },
];
export async function runProof(mode = "weak") {
  if (!["weak", "strict"].includes(mode))
    throw new Error("Unknown verifier version");
  const source = await Promise.all(
    ["../fixtures/billing.mjs", "../fixtures/run.mjs"].map((p) =>
      readFile(new URL(p, import.meta.url), "utf8"),
    ),
  );
  const digest = createHash("sha256")
    .update(source.join("\n") + mode)
    .digest("hex");
  const controls = [];
  for (const v of variants) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const started = performance.now();
      try {
        const { stdout } = await exec(
          process.execPath,
          [runner.pathname, v.id, mode],
          { timeout: 5000, maxBuffer: 100000 },
        );
        const checks = JSON.parse(stdout);
        runs.push({
          iteration: i + 1,
          accepted: checks.every((c) => c.pass),
          checks,
          durationMs: Math.round(performance.now() - started),
        });
      } catch (e) {
        runs.push({
          iteration: i + 1,
          error: "Fixture execution failed",
          detail: e.code ?? "execution_error",
        });
      }
    }
    const error = runs.some((r) => r.error);
    const stable = !error && new Set(runs.map((r) => r.accepted)).size === 1;
    const correct =
      stable && runs.every((r) => r.accepted === (v.expect === "accept"));
    controls.push({
      ...v,
      runs,
      stable,
      correct,
      status: error
        ? "execution error"
        : !stable
          ? "unstable"
          : correct
            ? "expected result"
            : v.expect === "accept"
              ? "false rejection"
              : "false acceptance",
    });
  }
  const ready = controls.every((c) => c.correct);
  return {
    schemaVersion: 1,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    task: "seat-proration-01",
    synthetic: true,
    mode,
    digest,
    controls,
    ready,
    scope:
      "Local synthetic controls only. Not a Real-SWE result or a security audit.",
    coverage:
      mode === "strict"
        ? ["R1", "R2", "R3", "R4", "R5"]
        : ["R1", "R2", "R4", "R5"],
  };
}
