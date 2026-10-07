# TaskFlow — Playwright + TypeScript QA Portfolio

Personal portfolio by Durgaprasad Regonda. A complete automation project with an included task-management website and REST API. The website runs at **http://127.0.0.1:4173**. It requires no account, API key or internet access at test time once dependencies and browsers are installed.

## Windows quick start
Extract the ZIP. Open the folder containing `package.json`, `package-lock.json` and `playwright.config.ts` in VS Code. Open its terminal and enter each command separately:
```powershell
npm ci
npm run typecheck
$env:PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT="120000"
npx playwright install chromium --only-shell
npm test
npm run report
```
Wait for each command to finish before entering the next. The tests start and stop the included website automatically. The API suite can run without any browser download:
```powershell
npm run test:api
```
If Chromium downloads are blocked and Google Chrome is already installed:
```powershell
npm run test:chrome
```
Or use installed Microsoft Edge:
```powershell
npm run test:edge
```
Chrome/Edge projects use the installed browser channel. Screenshots and traces are enabled; video is intentionally omitted so installed-browser runs do not need Playwright's separate video encoder. These alternatives require an installed compatible browser and are not guaranteed by the presence of a shortcut alone.

## See the website manually
```bash
npm start
```
Open http://127.0.0.1:4173 . Stop the website with Ctrl+C before running the tests; Playwright reserves that port and starts its own fresh server. Tasks survive page reloads but are stored in memory and reset when the server restarts. Each browser gets a demo workspace; this is data partitioning for tests, not authentication or production authorization.

## Coverage
| UI workflows | REST API checks |
| --- | --- |
| Empty state and priority-based creation | Create/read/update/delete contracts |
| Blank title and keyboard submission | Empty, whitespace and overlength titles |
| Completion, filters and counters | Exact 100-character boundary |
| Editing and reload persistence | Invalid priority and completion types |
| Deletion and clear-completed | Missing resource and malformed JSON |
| Simulated service failure and retry | Workspace header and data isolation |
| Safe display of HTML-like text | Persistence of valid data after invalid update |

14 API tests and 13 UI tests. UI tests can run against Chromium, installed Chrome, installed Edge, Firefox, WebKit and Pixel 7 emulation. Default `npm test` runs the API suite once plus Chromium UI tests. Mobile emulation is not real-device testing. See `docs/VALIDATION.md` for actual results rather than configured coverage.

## Framework design
- `app/`: website and Node.js REST API, no framework dependency
- `pages/`: typed page object using role/label locators and stable test IDs
- `fixtures/`: unique workspace per test and guaranteed cleanup
- `support/`: typed API client
- `tests/`: independent API and UI suites
- `.github/workflows/`: automated checks and uploaded reports
- `docs/`: strategy, interview guide and Naukri description

Every test owns its workspace. API contexts are independent of browsers, so `npm run test:api` never launches a browser. UI/API checks share a workspace explicitly. No fixed sleeps, shared mutable test data, or serial execution dependencies. Server startup is managed by Playwright's webServer configuration.

## Commands
| Command | Purpose |
| --- | --- |
| `npm test` | API + Chromium UI regression |
| `npm run test:api` | API suite, no browser required |
| `npm run test:chrome` | UI on installed Chrome |
| `npm run test:edge` | UI on installed Edge |
| `npm run test:smoke` | Chromium smoke tests |
| `npm run test:headed` | Watch installed Chrome run |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | HTML report |
| `npm run typecheck` | Strict TypeScript check |

For Firefox/WebKit/mobile, install the needed bundled browsers (`npx playwright install`) then run the relevant project, e.g. `npx playwright test --project=firefox`. `npm run test:all` also runs installed Chrome/Edge and therefore requires all configured engines/channels to be present.

## GitHub publication
Create an empty repository named `taskflow-playwright` in your account, then run these commands from the project folder:
```bash
git init
git add .
git commit -m "Add TaskFlow Playwright TypeScript portfolio"
git branch -M main
git remote add origin https://github.com/prasadregonda1/taskflow-playwright.git
git push -u origin main
```
This is a proposed repository URL, not an already published link. GitHub authentication is required on your machine. The CI workflow runs automatically after pushing. Add its actual repository link to Naukri only after publication.

## Limits
This is an intentionally small personal demo, not employer/client work. It has no login, database, checkout or production infrastructure. Workspace IDs are not secrets and do not provide real access control. The HTML-text test covers one injection regression and is not a security audit. API validation and local deterministic data make tests reproducible, but the project does not claim production load, full accessibility or real-device certification.

## Official references
- https://playwright.dev/docs/test-webserver
- https://playwright.dev/docs/browsers
- https://playwright.dev/docs/test-fixtures
