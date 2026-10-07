# Test strategy

Primary risk: CRUD operations lose data or update the wrong task. Validate final UI state and persisted API values. Test empty/whitespace titles, the exact title-length boundary, malformed input and invalid updates. Simulated 503 responses verify user-visible error handling and retry without silently losing the draft.

Isolation: UUID workspace per test; test-scoped API context; teardown deletes only that test's workspace. No global reset while parallel tests run. Browser/API suites are separate to avoid unnecessary engine launches. The in-memory server restarts per run; it is not production persistence.

Execution: strict typecheck, API regression, Chromium smoke/regression, then other configured engines as needed. CI keeps a bounded retry and uploads diagnostics even on failure. Investigate retries and report first-attempt failures.

Scope: core task-management behavior. No production authentication, load testing or complete accessibility/security audit. Pixel emulation does not validate a physical device. Assertions validate behavior, not just successful clicks.
