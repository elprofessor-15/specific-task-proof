# Verification

Checked October 28, 2026.

- Node behavioral tests: 8 passing. Covers date clipping, integer-cent rounding, false acceptance, strengthened assertions, repeated executions, digest identity, invalid mode rejection, evidence export semantics, and execution-error classification.
- Build: all application modules pass Node syntax checks.
- Browser: weak run produces a blocked gate; cancellation mutation passes all three repeats. One-click strengthening switches verifier and reruns. Strict mode passes control expectations with cancellation failure evidence (1,001 vs 501 cents). Requirements and manifest views inspected.
- Browser note entry and export control activated. Browser download event capture timed out and filesystem receipt was not confirmed. Verified the inspectable JSON preview contains the exact run ID and reviewer note; CLI JSON output is independently verified. Download receipt remains unverified in this automation environment.
- Responsive CSS includes mobile/tablet breakpoints, but the browser viewport override did not change the reported 1,470px viewport. Mobile rendering has not been verified.
- Invalid API mode returns HTTP 400.
- No licensed/private data or external model requests used.

To reproduce: `npm test`, `npm run build`, `npm start`, and the README's four-step walkthrough. The server is stopped after QA; start it again to use localhost.
