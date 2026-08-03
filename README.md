# Phishing Report Triage

A deliberately small classroom application for learning how to supervise a coding
agent: read a small, honest codebase, make one bounded change, and review the diff.

## What this is

A queue where an employee reports a suspicious email (sender, subject, a short
note, and the date it arrived), and a security analyst gives it a verdict:
`New`, `Investigating`, or `Phishing`. The analyst can filter the queue by verdict.

This is a classroom prototype. Data is stored only in your own browser, on your
own computer. **Do not enter a real or sensitive phishing report** - use invented
examples (a fake sender, a fake subject line). Nothing here is monitored, backed
up, or shared with anyone.

## What it deliberately does not have, and why

These are absences by design, not things that were forgotten:

- **No accounts or login.** There is one queue, used by one person at a time, in
  one browser. Adding accounts would add a whole feature nobody asked for.
- **No server or shared database.** Nobody needs two computers to see the same
  queue. `localStorage` (built into every browser) is enough, and leaving it out
  keeps this repository small enough to read in ten minutes.
- **No real or personal data.** This is a teaching tool, not an incident-response
  system. Treat every report you type here as a fictional example.
- **No payments, no monorepo.** They are simply not part of the problem this app
  solves.

If working through the exercises makes you want one of these, that is a sign you
understood the app correctly - just do not build it here.

## Running it (step by step, for someone who has never cloned a repository)

You need [Node.js](https://nodejs.org) version 22.12 or newer installed on your
computer. If you use `nvm` (a tool for managing Node versions), run `nvm use` in
this folder and it picks the right version automatically (see `.nvmrc`).

1. Open a terminal and move into this folder:
   ```bash
   cd path/to/starter
   ```
2. Install the project's dependencies (downloads the libraries the app needs;
   this only has to happen once, or whenever they change):
   ```bash
   npm ci
   ```
3. Install the browser Playwright uses for automated tests (also a one-time step):
   ```bash
   npx playwright install chromium
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open the address the terminal prints (usually `http://127.0.0.1:4173`) in your
   web browser. You should see "Phishing Report Triage".

To stop the app, go back to the terminal and press `Ctrl+C`.

## Checking your work

Before you consider any change finished, run:

```bash
npm run verify
```

This runs, in order: a type check, the linter, the automated unit tests, and a
production build. All four must pass.

Then run the browser tests, which drive a real Chromium browser through the app:

```bash
npm run test:e2e
```

If any of these fail, read the output - it tells you what broke and where. A
failing check is information, not something to work around.

## What lives where

- `src/report-triage/` - the rules: what a report looks like, what counts as a
  valid one, which verdict can follow another, and how reports are stored. No
  user-interface code lives here.
- `src/ui/` - the screen. It asks `src/report-triage/` what to show and what to
  do; it does not decide the rules itself.
- `tests/` - `*.test.ts` files run in Node (fast, no browser); `*.browser.test.ts`
  files drive a real browser (slower, more realistic).
- `docs/` - the product brief, the day-two lab exercise, and one architecture
  decision record explaining why the rules and the screen are kept apart.

## Learning workflow

1. Read `docs/PRODUCT_BRIEF.md` and `docs/adr/ADR-0001-report-triage-module-boundary.md`.
2. Do the exercise in `docs/LAB.md`.
3. Read the diff your coding agent produced before you trust it.
4. Run the checks above yourself. A green run reported by an agent is a claim,
   not proof.
5. Swap with your pair and review each other's diff and evidence footer.
