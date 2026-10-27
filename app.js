import { evidenceFor, verdictFor } from "/src/evidence.mjs";
const root = document.querySelector("#app");
let mode = "weak",
  tab = "controls",
  proof = null,
  busy = false,
  error = "",
  selected = "ignores-cancellation",
  note = "";
const requirements = [
  ["R1", "Keep full-month billing unchanged", "Product brief · line 1", "full"],
  ["R2", "Charge only from activation", "Product brief · line 2", "join"],
  ["R3", "Stop charging at cancellation", "Billing policy · §2", "cancel"],
  ["R4", "Charge zero outside the period", "Billing policy · §2", "outside"],
  ["R5", "Round once, in integer cents", "Finance convention · §3", "round"],
];
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const badge = (s, good = false) =>
  `<span class="badge ${good ? "good" : "warn"}">${s}</span>`;
function render() {
  const control = proof?.controls.find((c) => c.id === selected);
  const verdict = proof ? verdictFor(proof) : null;
  root.innerHTML = `<header><a class="wordmark" href="/">specific<span class="slash">/</span><span class="product">task proof</span></a><span class="independent">Independent working concept</span><a href="https://withspecific.com/benchmarks/real-swe" target="_blank" rel="noreferrer">Research context ↗</a></header>
 <main><div class="eyebrow">TASK QUALITY / ORIGINAL SYNTHETIC ENVIRONMENT</div><section class="intro"><div><h1>A passing test isn't<br>a proven task.</h1><p>Check the verifier before it checks the agent.<br>Run controls, challenge edge cases, and keep the evidence.</p></div><div class="intro-note"><span class="small-label">THE REVIEW QUESTION</span><p>Would a plausible wrong fix<br>still earn a passing grade?</p><span class="mono">01 / seat-proration</span></div></section>
 <section class="workspace"><div class="task-head"><div><span class="small-label">BILLING · NODE.JS · 5 REQUIREMENTS</span><h2>Prorate seats across an invoice period</h2><p>Preserve full-month charges. Respect activation, cancellation, and rounding.</p></div><span class="task-id">SYN-001<br><span>Reviewer workspace</span></span></div>
 <div class="versionbar"><div><span class="small-label">VERIFIER VERSION</span><div class="segmented"><button data-mode="weak" class="${mode === "weak" ? "active" : ""}" ${busy ? "disabled" : ""}>v1 · initial</button><button data-mode="strict" class="${mode === "strict" ? "active" : ""}" ${busy ? "disabled" : ""}>v2 · cancellation added</button></div></div><div class="run-actions"><span class="mono">4 controls × 3 runs</span><button class="primary" id="run" ${busy ? "disabled" : ""}>${busy ? "Running local checks…" : "Run proof"} <span>↗</span></button></div></div>
 ${error ? `<div role="alert" class="error">${escape(error)}</div>` : ""}
 <div class="verdict ${proof ? (proof.ready ? "ready" : "blocked") : ""}" aria-live="polite"><span class="verdict-icon">${proof ? (proof.ready ? "✓" : "!") : "○"}</span><div><strong>${proof ? (proof.ready ? "Controls passed. Ready for human review." : verdict.title) : "Evidence first. Run the local controls."}</strong><p>${proof ? (proof.ready ? "Both mutations rejected; reference accepted across three repeats. This is a bounded check, not a proof of completeness." : verdict.detail) : "Real child processes execute the bundled fixture. No model calls or simulated run results."}</p></div>${proof ? badge(proof.ready ? "REVIEWABLE" : verdict.blockers === 1 ? "1 BLOCKER" : verdict.blockers + " BLOCKERS", proof.ready) : ""}</div>
 <nav class="tabs" aria-label="Review sections">${[
   ["controls", "01", "Control runs"],
   ["coverage", "02", "Requirement evidence"],
   ["package", "03", "Review & export"],
 ]
   .map(
     ([key, n, label]) =>
       `<button data-tab="${key}" class="${tab === key ? "selected" : ""}" aria-current="${tab === key ? "page" : "false"}"><span>${n}</span>${label}</button>`,
   )
   .join("")}</nav>
 ${
   tab === "controls"
     ? `<div class="control-layout"><div class="control-list"><div class="list-caption">CONTROL / EXPECTATION <span>REPEATS</span></div>${(
         proof?.controls ?? [
           { id: "baseline", name: "Unchanged baseline", expect: "reject" },
           { id: "reference", name: "Reference solution", expect: "accept" },
           {
             id: "ignores-cancellation",
             name: "Mutation · cancellation",
             expect: "reject",
           },
           {
             id: "rounds-early",
             name: "Mutation · rounding",
             expect: "reject",
           },
         ]
       )
         .map(
           (c) =>
             `<button class="control ${selected === c.id ? "chosen" : ""}" data-control="${c.id}"><div><strong>${c.name}</strong><small>Should ${c.expect}${c.status ? " · " + c.status : ""}</small></div><div class="dots">${[0, 1, 2].map((i) => `<i class="${c.runs ? (c.runs[i].error ? "bad" : c.correct ? "ok" : "bad") : ""}"></i>`).join("")}</div></button>`,
         )
         .join(
           "",
         )}<p class="list-foot">A red repeat means the observed outcome disagrees with the control's expected result.</p></div><div class="evidence"><div class="small-label">${control ? "OBSERVED BEHAVIOR" : "CONTROL DESIGN"}</div><h3>${control?.name ?? "Challenge the happy path."}</h3><p>${control?.reason ?? "A reference solution should pass. The unchanged code and deliberately incomplete fixes should fail."}</p>${control ? `<div class="assertions">${control.runs[0].checks?.map((c) => `<div><span class="${c.pass ? "check" : "cross"}">${c.pass ? "✓" : "×"}</span><span>${c.name}</span><code>${c.actual} / ${c.expected}¢</code></div>`).join("") ?? "Execution failed; no grading decision is valid."}</div><div class="evidence-footer"><span>Actual / expected · first repeat</span><span>${control.runs.map((r) => r.durationMs + "ms").join(" · ")}</span></div>${selected === "ignores-cancellation" && mode === "weak" ? `<aside><strong>The missing assertion</strong><p>A seat cancelled on April 16 is billed 1,001¢ instead of 501¢. v1 never asks this question.</p><button id="strengthen">Add cancellation check & rerun →</button></aside>` : ""}` : `<div class="terminal"><span>$ npm run proof -- strict</span><p>baseline → reject<br>reference → accept<br>cancellation mutation → reject<br>rounding mutation → reject</p><small>Expected outcomes, not recorded results</small></div>`}</div></div>`
     : ""
 }
 ${tab === "coverage" ? `<div class="coverage-head"><h3>Every graded rule needs a discoverable reason.</h3><p>The task brief and repository policy are agent-visible. Assertions and reference code remain reviewer-side in this concept.</p></div><div class="requirements">${requirements.map(([id, title, source, check]) => `<article><span class="mono">${id}</span><div><h4>${title}</h4><p>${source}</p></div><code>${check}</code>${proof ? badge(proof.coverage.includes(id) ? "CHECKED" : "MISSING", proof.coverage.includes(id)) : '<span class="muted">Run required</span>'}</article>`).join("")}</div><div class="policy"><div><span class="small-label">AGENT-VISIBLE CONTEXT</span><h3>Billing policy / excerpt</h3><p>§2 Charge the overlap between the seat's active interval and the invoice period. Start is inclusive; cancellation and period end are exclusive. No overlap produces a zero charge.</p><p>§3 Prices are integer cents. Round the final line total once. Do not round the daily rate.</p></div><div><span class="small-label">VERIFIER DELTA / v1 → v2</span><pre>+ seat.ended = '2026-04-16'\n+ expected = 501 cents\n+ assert actual === expected</pre><p>One added assertion catches the surviving cancellation mutation. These five cases do not exhaust the input space.</p></div></div>` : ""}
 ${tab === "package" ? `<div class="review-layout"><div><span class="small-label">EVIDENCE HANDOFF</span><h3>A reviewable decision, tied to this run.</h3><p>Export the exact controls, assertion results, timestamps, fixture digest, and reviewer note. Changing verifier version clears the previous run.</p><label for="note">Reviewer note</label><textarea id="note" placeholder="What did you inspect? What still needs validation?">${escape(note)}</textarea><button class="primary" id="export" ${!proof ? "disabled" : ""}>Download evidence.json ↓</button>${proof ? `<details><summary>Inspect evidence JSON</summary><pre class="json-preview">${escape(JSON.stringify(evidenceFor(proof, note), null, 2))}</pre></details>` : ""}<p class="muted">${proof?.ready ? "Control gate passed. Human review and sandbox validation remain required." : "Evidence can be exported while blocked, with the blocker preserved."}</p></div><div class="manifest"><span class="small-label">RUN MANIFEST</span><dl><dt>Task</dt><dd>seat-proration-01</dd><dt>Verifier</dt><dd>${mode === "weak" ? "v1 · initial" : "v2 · cancellation added"}</dd><dt>Run</dt><dd>${proof?.id ?? "Not executed"}</dd><dt>Fixture SHA-256</dt><dd>${proof?.digest ?? "Available after run"}</dd><dt>Gate</dt><dd>${proof ? (proof.ready ? "Controls passed" : "Blocked") : "Pending"}</dd><dt>Data boundary</dt><dd>Original synthetic fixture. No private codebases, model scores, or external integrations.</dd></dl></div></div>` : ""}
 </section><footer><span>Built by C Abhineeth · Product engineering concept for Specific</span><span>Local execution / no API keys</span></footer></main>`;
  root.querySelectorAll("[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        mode = b.dataset.mode;
        proof = null;
        note = "";
        error = "";
        render();
      }),
  );
  root.querySelectorAll("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.tab;
        render();
      }),
  );
  root.querySelectorAll("[data-control]").forEach(
    (b) =>
      (b.onclick = () => {
        selected = b.dataset.control;
        render();
      }),
  );
  root.querySelector("#run").onclick = run;
  root.querySelector("#strengthen")?.addEventListener("click", () => {
    mode = "strict";
    proof = null;
    note = "";
    run();
  });
  root.querySelector("#note")?.addEventListener("input", (e) => {
    note = e.target.value;
    const preview = root.querySelector(".json-preview");
    if (preview && proof)
      preview.textContent = JSON.stringify(evidenceFor(proof, note), null, 2);
  });
  root.querySelector("#export")?.addEventListener("click", () => {
    const data = evidenceFor(proof, note);
    const a = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    a.href = url;
    a.download = `task-proof-${proof.mode}-${proof.id.slice(0, 8)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
async function run() {
  busy = true;
  proof = null;
  note = "";
  error = "";
  render();
  try {
    const r = await fetch(`/api/proof?mode=${mode}`, { method: "POST" });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    proof = data;
  } catch (e) {
    error = e.message;
  } finally {
    busy = false;
    render();
  }
}
render();
