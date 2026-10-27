import test from "node:test";
import assert from "node:assert/strict";
import { charge } from "../fixtures/billing.mjs";
import { runProof } from "../src/proof.mjs";
const period = { start: "2026-04-01", end: "2026-05-01", price: 1001 };
test("reference preserves price and clips both boundaries", () => {
  assert.equal(charge({ started: "2026-03-01" }, period, "reference"), 1001);
  assert.equal(
    charge({ started: "2026-04-16", ended: "2026-04-21" }, period, "reference"),
    167,
  );
  assert.equal(
    charge({ started: "2026-03-01", ended: "2026-03-15" }, period, "reference"),
    0,
  );
  assert.equal(charge({ started: "2026-05-01" }, period, "reference"), 0);
});
test("reference rounds final total rather than daily rate", () => {
  assert.equal(charge({ started: "2026-04-16" }, period, "reference"), 501);
  assert.equal(charge({ started: "2026-04-16" }, period, "rounds-early"), 495);
});
test("weak verifier exposes false acceptance with actual evidence", async () => {
  const p = await runProof("weak");
  assert.equal(p.ready, false);
  const mutant = p.controls.find((c) => c.id === "ignores-cancellation");
  assert.equal(mutant.correct, false);
  assert.equal(mutant.stable, true);
  assert.deepEqual(
    mutant.runs.map((r) => r.accepted),
    [true, true, true],
  );
  assert.ok(!p.coverage.includes("R3"));
  assert.equal(p.controls.find((c) => c.id === "reference").correct, true);
});
test("strict verifier rejects both mutants and baseline but accepts reference", async () => {
  const p = await runProof("strict");
  assert.equal(p.ready, true);
  assert.equal(p.controls.length, 4);
  for (const c of p.controls) {
    assert.equal(c.correct, true);
    assert.equal(c.runs.length, 3);
    assert.ok(c.runs.every((r) => r.checks.length === 5));
  }
  const cancel = p.controls
    .find((c) => c.id === "ignores-cancellation")
    .runs[0].checks.find((c) => c.id === "cancel");
  assert.equal(cancel.actual, 1001);
  assert.equal(cancel.expected, 501);
  assert.equal(cancel.pass, false);
});
test("run identity is unique and digest binds verifier version", async () => {
  const a = await runProof("weak");
  const b = await runProof("weak");
  const c = await runProof("strict");
  assert.notEqual(a.id, b.id);
  assert.equal(a.digest, b.digest);
  assert.notEqual(a.digest, c.digest);
  assert.match(a.digest, /^[a-f0-9]{64}$/);
});
test("unrecognized modes never execute fixture commands", async () => {
  await assert.rejects(
    () => runProof("arbitrary; touch /tmp/no"),
    /Unknown verifier/,
  );
});

test("evidence preserves blocked gate and binds the exact run and note", async () => {
  const { evidenceFor } = await import("../src/evidence.mjs");
  assert.throws(() => evidenceFor(null), /Run proof/);
  const p = await runProof("weak");
  const exported = JSON.parse(JSON.stringify(evidenceFor(p, "Needs R3")));
  assert.equal(exported.id, p.id);
  assert.equal(exported.digest, p.digest);
  assert.equal(exported.review.status, "blocked");
  assert.equal(exported.review.note, "Needs R3");
  assert.equal(p.review, undefined);
});

test("execution errors are not described as agent or verifier successes", async () => {
  const { verdictFor } = await import("../src/evidence.mjs");
  const verdict = verdictFor({
    controls: [
      { id: "reference", correct: false, runs: [{ error: "timeout" }] },
    ],
  });
  assert.match(verdict.title, /Execution evidence is incomplete/);
  assert.equal(verdict.blockers, 1);
});
