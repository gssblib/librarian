# Browser regression tests

These tests protect the workflows captured before the Angular 16 to 22 upgrade. They
exercise the real compiled backend and both production frontend builds in
Chromium, with a fresh fictional MySQL database for each run. No cloud account,
production export, Firebase emulator, or production configuration is needed.

## Setup

Use Node 24.22.1 or newer in the Node 24 line for the frontend, backend and
Playwright, and MySQL 8.4. The harness supports local
macOS/Linux MySQL installations; a running MySQL service is not required.

From the repository root, with Node 24 on `PATH`:

```sh
npm --prefix server ci
npm --prefix client ci

cd tests/browser
npm ci
npx playwright install chromium
```

Then, with Node 24 on `PATH`:

```sh
npm test
```

The frontend uses the same Node executable as the test runner. For investigating
older revisions, `E2E_FRONTEND_NODE` can explicitly override the frontend runtime.
Set `E2E_MYSQLD=/absolute/path/to/mysqld` if MySQL 8.4 is not in one of the
standard Homebrew/Linux locations. Run as your ordinary user, not root.

`npm test` builds both frontends and the backend first. After a successful build,
`npm run test:built` reruns just the browser suite. Do not use that shortcut after
changing application code: it would test stale compiled output.

## What is covered

- Staff login, failed login, session persistence, and logout.
- Catalog search, author filtering, sorting, pagination, details, and covers.
- Drag-and-drop cover uploads and rendering a stored PDF label through the real API.
- Required-field validation and saving an edit through a full page reload.
- Borrower creation/editing, required email validation, and persisted state dropdown changes.
- Calendar selection in a New York timezone, the submitted date, and persisted computed fees.
- Administration tabs, CSV file selection, and canceling queue/cycle deletion dialogs.
- Order-cycle details, report date/filter persistence, and CSV export contents.
- Borrower search and the checkout/renew/return/history workflow.
- Canceling a destructive confirmation dialog.
- Family login, restricted permissions, catalog search, and existing loans.
- Desktop and narrow-screen catalog layouts and the deletion dialog.

The legacy Karma/Protractor tests are separate and are not run by this suite.
This is a practical regression baseline, not exhaustive coverage. Real school
authentication, email delivery, Firebase hosting, and PDF/label generation are
outside its scope. The school stub validates the fixture credentials while the
application's real login, JWT, and permission code still runs.

## Known issues found while establishing the baseline

Three tests in `specs/known-issues.spec.cjs` are marked as **expected failures**,
not skipped. They describe desired behavior and run on every invocation. Each
exception requires its known symptom or error signature. When ordering succeeds,
the rest of that workflow must pass normally. Remove obsolete checks as bugs are fixed.
The current result is 19 passing workflow tests and 3 reproduced known failures.
Playwright may include expected failures in its overall "passed" count; read the
annotations in the report rather than treating that count as 22 working flows.

1. **Failed family login:** the backend correctly returns 401, but the public
   login screen leaves the Login button disabled and does not display the error
   after the response. A likely cause is that the public root uses OnPush change
   detection while the shared login component does not explicitly request a refresh.
2. **Placing a family order:** the API returns 500 because the borrower permission
   restriction reads `action.params.borrower`, while the order route supplies no
   `params` in its authorization action. This is in the existing backend code,
   independent of an Angular upgrade.
3. **Order-cycle date/time fields:** creation and editing request a Formly type
   named `datetimepicker`, but the application never registers that type. Both
   controls are absent and Angular logs the missing-type error. A read-only check
   of the local Angular 16.2.12 app reproduced the same error and zero form inputs
   on November 3, 2026. The upgrade leaves this existing bug unchanged; creating
   or editing order-cycle dates does not yet have passing coverage.

These application bugs are not fixed by the tests or Angular upgrade. Successful family
ordering and order removal therefore do not yet have passing end-to-end coverage.
These findings were reproduced locally, not by submitting requests to production.
The narrow screenshot also records existing horizontal overflow and clipped
fields. It detects changes to the current layout; it does not certify mobile usability.

Unexpected Angular console errors fail the suite alongside uncaught browser
errors. Only the specific missing-type message is allowed in its known-issue
test, which verifies the error before marking the absent controls as expected
failure. Other errors still fail normally. Administration checks do not execute
external Antolin synchronization or import a Sycamore family file.

## Isolation

The harness claims ports 4242 and 4243 and refuses to reuse an existing server.
It creates its own temporary MySQL data directory and Unix socket, disables
database TCP access, and resets fictional records before every test. It never
accepts an existing database URL or socket. Backend outbound connections are
limited to that socket and the local school-login stub; browser requests are
limited to the two test origins. Email transport is disabled. Normal shutdown
removes the temporary database; a forcibly killed process may leave a directory
named `librarian-e2e-*` in the OS temporary directory.

Tests run sequentially because they share this disposable database. Your usual
local app on ports 4200/5005 and its dev/QA data are not used.

## Reviewing results and screenshots

`npm run report` opens the HTML report. Failed tests retain a browser trace and
screenshot under `test-results/`; these generated artifacts are ignored by Git.
The small reference PNGs next to the spec are intentionally tracked.

The initial screenshot baselines are for macOS Chromium at the pinned Playwright
version. Rendering differs across operating systems; see Playwright's
[visual comparison guidance](https://playwright.dev/docs/test-snapshots).
On another OS, `npm run test:built -- --ignore-snapshots` runs the functional
checks without claiming visual coverage. To establish or deliberately update
baselines, run `npm run test:built -- --update-snapshots`, inspect every changed
image, and commit only intentional changes. Do not update baselines simply to
make a failing upgrade pass.
