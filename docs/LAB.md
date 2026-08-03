# Lab: Add the "False alarm" Verdict

## Time box

18 minutes. Stop and compare notes with your pair even if you are not finished -
an honest partial attempt teaches more than a rushed green checkmark.

## The task

Right now an analyst can move a report `New -> Investigating -> Phishing`.
Sometimes an investigation shows the email was legitimate after all. Add a
fourth verdict, `False alarm`, reachable only from `Investigating`, **without**
writing a new button, a new `if`, or any verdict-specific logic inside
`src/ui/App.tsx`.

If you find yourself editing `App.tsx` to add a button, a label, or a condition
that mentions "False alarm" by name, stop - that is exactly the mistake this lab
exists to catch. The screen already renders one action button per report for
every verdict the module says is reachable from the report's current verdict.
Your job is to change what the module says is reachable, not to teach the screen
a new fact.

## Where to look

Point your coding agent (or look yourself) at `src/report-triage/transitions.ts`.
That file is the one place in this codebase that decides which verdict can
follow another. Everything else - the queue, the storage, the screen - asks that
file. None of them decide on their own.

## Steps

1. Open `src/report-triage/types.ts` and add `'False alarm'` to the `Verdict`
   union.
2. Run `npm run typecheck`. It fails inside `transitions.ts`, because the
   transition table no longer covers every verdict. Read the error - it is
   pointing you at the one place left to fix.
3. In `transitions.ts`, add `'False alarm'` as a value reachable from
   `Investigating`, and give `'False alarm'` its own empty list of further moves
   (it is a final verdict, the same way `Phishing` is).
4. Add a unit test to `tests/report-triage.test.ts` proving:
   - `nextVerdicts('Investigating')` now includes `'False alarm'`;
   - moving a report straight from `'New'` to `'False alarm'` is still rejected.
5. Run `npm run verify` and `npm run test:e2e`. Do not edit `src/ui/App.tsx`.
6. Open the app (`npm run dev`), report an email, mark it `Investigating`, and
   confirm a new "Mark as False alarm" button appears next to "Mark as Phishing"
   - without your having written any screen code for it.

## Done looks like

- `Verdict` includes `'False alarm'`, reachable only from `Investigating`.
- `src/report-triage/transitions.ts` is the only file where a verdict name and a
  transition rule appear together.
- `src/ui/App.tsx` has zero new lines that mention `'False alarm'`,
  `'Investigating'`, or `'Phishing'` by name.
- The new unit test from step 4 passes.
- `npm run verify` passes.
- `npm run test:e2e` passes.
- `git status --short` shows no forgotten file.

## Evidence footer

Fill this in and hand it to your reviewing pair before you explain the change in
words.

```text
Branch:
Base commit:
Head commit:

What the checks proved:


Three sentences on what the agent did NOT prove:
1.
2.
3.
```
