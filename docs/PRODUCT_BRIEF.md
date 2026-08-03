# Product Brief: Phishing Report Triage

This is the worked example. Copy this eight-line shape for your own briefs before
you ask an agent to build anything: it forces you to separate what you observed
from what you assume, and it names the boundary before code exists to enforce it.

## Actor

A security analyst who triages phishing reports, and the employee who submits them.

## Observation

Employees forward suspicious emails by whatever channel is closest to hand, and
an analyst working from a growing, undifferentiated pile cannot tell which ones
still need a verdict from which ones have already been handled.

## Outcome

An analyst can see, at a glance, which reported emails still need attention and
which have already been investigated or confirmed - without losing the history
of earlier decisions.

## Provisional mechanism

A queue of reports, each carrying one verdict. A report moves forward through a
small, fixed set of steps - New, then Investigating, then Phishing - and the
queue can be filtered by verdict. "Provisional" because only the observation and
outcome above are settled; the exact step names could still change.

## Examples, including the awkward ones

1. A report whose sender field itself contains an HTML-like string
   (`<img src=x onerror=...>`) must display as text on screen, not run.
2. An analyst tries to mark a brand-new report `Phishing` directly, skipping
   `Investigating` - the app refuses and says why.
3. Two employees report the same phishing campaign separately - each report is
   triaged on its own; this app does not detect or merge duplicates.
4. An employee reports a completely legitimate email by mistake. The analyst
   needs to say "this was not phishing," which this starter does not yet support
   - it is the day-two lab exercise (`docs/LAB.md`), not a hidden requirement.
5. The browser tab is closed mid-triage - work already saved to local storage is
   still there next time, but nothing is backed up anywhere else.

## Non-goals

Accounts or login. A server or shared database. Notifications. Real employee or
personal data. Deduplication or case merging. Exporting or reporting. Assigning
a report to a specific analyst.

## Permissions

Edit and test this repository. Never enter a real report, real email content, or
real personal data. Do not add authentication or a backend unless it is
explicitly requested and the brief for that request answers who needs to share
data, why local storage is no longer enough, and what the security boundary is.

## Done when

Every example above is true in the running app, `npm run verify` and
`npm run test:e2e` both pass, and the rule for which verdict can follow another
still lives in exactly one place in the code.
