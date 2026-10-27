export function evidenceFor(proof, note = "") {
  if (!proof?.id) throw new Error("Run proof before exporting");
  return {
    ...proof,
    review: {
      note,
      status: proof.ready ? "controls-passed-human-review-required" : "blocked",
    },
  };
}

export function verdictFor(proof) {
  const blockers = proof.controls.filter((c) => !c.correct).length;
  const errors = proof.controls.some((c) => c.runs.some((r) => r.error));
  if (errors)
    return {
      title: "Hold task. Execution evidence is incomplete.",
      detail:
        "At least one control failed to execute. Resolve the environment error before interpreting grades.",
      blockers,
    };
  const cancellation = proof.controls.find(
    (c) => c.id === "ignores-cancellation",
  );
  if (cancellation?.status === "false acceptance")
    return {
      title: "Hold task. A wrong fix passes the verifier.",
      detail:
        "The cancellation mutation is accepted in 3 of 3 runs. The task would reward incomplete behavior.",
      blockers,
    };
  return {
    title: "Hold task. Control expectations disagree.",
    detail:
      "Inspect false rejection or inconsistent outcomes before accepting this verifier.",
    blockers,
  };
}
