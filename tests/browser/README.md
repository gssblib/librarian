# Browser regression tests

These tests capture the existing Angular 16 behavior before its upgrade. They
exercise the real compiled backend and both production frontend builds in
Chromium, with a fresh fictional MySQL database for each run. No cloud account,
production export, Firebase emulator, or production configuration is needed.

## Setup

Use Node 24.22.1 or newer in the Node 24 line for the backend and Playwright,
Node 18 for the current Angular build, and MySQL 8.4. The harness supports local
macOS/Linux MySQL installations; a running MySQL service is not required.

From the repository root, with Node 24 on `PATH`:

```sh
npm --prefix server ci
# Run this install with Node 18 on PATH:
npm --prefix client ci --legacy-peer-deps

cd tests/browser
npm ci
npx playwright install chromium
```

Then, with Node 24 on `PATH`, supply the path to the frontend's Node executable:

```sh
E2E_FRONTEND_NODE=/absolute/path/to/node18 npm test
```

For example, with nvm, use `E2E_FRONTEND_NODE="$(nvm which 18)" npm test`.
Set `E2E_MYSQLD=/absolute/path/to/mysqld` if MySQL 8.4 is not in one of the
standard Homebrew/Linux locations. Run as your ordinary user, not root.

`npm test` builds both frontends and the backend first. After a successful build,
`npm run test:built` reruns just the browser suite. Do not use that shortcut after
changing application code: it would test stale compiled output.

## What is covered

- Staff login, failed login, session persistence, and logout.
- Catalog search, author filtering, sorting, pagination, details, and covers.
- Required-field validation and saving an edit through a full page reload.
- Borrower search and the checkout/renew/return/history workflow.
- Canceling a destructive confirmation dialog.
- Family login, restricted permissions, catalog search, and existing loans.
- Desktop and narrow-screen catalog layouts and the deletion dialog.

The legacy Karma/Protractor tests are separate and are not run by this suite.
This is a practical regression baseline, not exhaustive coverage. Real school
authentication, email delivery, Firebase hosting, and PDF/label rendering are
outside its scope. The school stub validates the fixture credentials while the
application's real login, JWT, and permission code still runs.

## Known issues found while establishing the baseline

Two tests in `specs/known-issues.spec.cjs` are marked as **expected failures**,
not skipped. They describe desired behavior and run on every invocation. An
unexpected pass fails the suite so the annotation can be removed after a fix.
The initial result is 12 passing workflow tests and 2 reproduced known failures.
Playwright may include expected failures in its overall "passed" count; read the
annotations in the report rather than treating that count as 14 working flows.

1. **Failed family login:** the backend correctly returns 401, but the public
   login screen leaves the Login button disabled and does not display the error
   after the response. A likely cause is that the public root uses OnPush change
   detection while the shared login component does not explicitly request a refresh.
2. **Placing a family order:** the API returns 500 because the borrower permission
   restriction reads `action.params.borrower`, while the order route supplies no
   `params` in its authorization action. This is in the existing backend code,
   independent of an Angular upgrade.

Neither application bug is fixed by this test-only change. Successful family
ordering and order removal therefore do not yet have passing end-to-end coverage.
These findings were reproduced locally, not by submitting requests to production.
The narrow screenshot also records existing horizontal overflow and clipped
fields. It detects changes to the current layout; it does not certify mobile usability.

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
