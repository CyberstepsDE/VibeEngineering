# ADR-0001: Report Triage Module Boundary

- Status: Accepted
- Date: 2026-08-03

## Context

The screen needs to accept a phishing report, list and filter it by verdict, and
move it forward through an analyst's workflow (New, then Investigating, then
Phishing). Field validation, storage format, and which verdict may follow
another are implementation details. If the screen owns any of them directly,
the same rule can end up written twice - one place allows a move the other
refuses, and nobody notices until a user does.

## Decision

`src/report-triage/` exposes a small public surface - `createReportQueue`,
`nextVerdicts`, `VERDICTS`, and the `PhishingReport` / `Verdict` types - and owns
everything behind it:

- field validation (`validation.ts`),
- the verdict transition table (`transitions.ts`) - the only place in this
  codebase that lists which verdict may follow another,
- storage key and serialization (`repository.ts`),
- request orchestration (`queue.ts`).

`src/ui/App.tsx` renders state and asks the module what to do. It does not touch
`localStorage`, and it does not contain a single line that names a specific
transition. Every action button on a report comes from calling
`nextVerdicts(report.verdict)` - the screen does not know, and must never be
made to know, which verdicts exist or which ones follow which.

## Consequences

- Storage can be replaced behind the interface without touching the screen.
- Unit tests exercise validation and the transition table without React or a DOM.
- Because `transitions.ts` types its table as `Record<Verdict, readonly Verdict[]>`,
  adding a verdict to the `Verdict` union and forgetting to add it to the table
  is a compile error, not a runtime surprise found by a user. The type system
  enforces "exactly one place" for us; see `docs/LAB.md` for a worked example.
- The module has more internal code than its public surface. That is intentional
  depth, not permission to add speculative abstractions.

## Rejected alternatives

- Encoding "which button shows for which verdict" directly in `App.tsx` - for
  example an `if (report.verdict === 'Investigating')` block per action. It is
  the fastest way to write the first screen, and the fastest way to end up with
  two disagreeing copies of the workflow the moment a second screen, or a second
  developer, touches it.
- A server database. No observed sharing or durability requirement exists for
  this classroom prototype; see `docs/PRODUCT_BRIEF.md`.
