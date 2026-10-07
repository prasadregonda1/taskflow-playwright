# Explain this project in an interview

**Why include a local website?** It gives deterministic data and repeatable workflows without relying on a shared public demo or credentials. Playwright automatically starts the server.

**How do parallel tests avoid collisions?** Each test generates a UUID workspace, passes it in API headers and the UI URL, and deletes only its own workspace in teardown.

**Why separate API and UI projects?** API checks use request contexts and need no browser. UI scenarios can repeat across engines without repeating every API test.

**Why page objects and fixtures?** The page object centralizes user actions and stable locators. Fixtures own setup, test dependencies and cleanup.

**What makes the failure test meaningful?** A routed POST returns 503; the UI must show the error, retain the draft, avoid creating a task and succeed after the route is removed.

**How do you debug a failure?** Inspect the HTML report, screenshot and trace; compare the API state with the UI expectation; reproduce the single test before changing selectors.

**What would you add for a real application?** Persistent database, genuine authentication/authorization, accessibility checks, broader security and load validation, and environment-specific configuration. The demo workspace mechanism is not production authorization.
