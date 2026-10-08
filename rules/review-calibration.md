# Review calibration - what is worth a blocker

> **Audience:** any agent or person doing a review pass, and the author deciding
> what to do with the findings.
> **Load this when:** you review a change, or you are about to act on a review.

## The rule

A review's output is evidence, not a work queue. Every finding goes through the
same gate as any other code (`rules/less-is-more.md`): which real behaviour
breaks, is the scenario observed or invented, and what does the bad outcome cost.

## Report these as blockers

- **Security holes a real stranger can reach**: input reaching a shell, a query or
  the page unescaped; a secret in code, config, logs or CI; data sent where the
  user did not ask; an endpoint anyone can abuse.
- **Logic errors on the plain path**: a wrong result for an ordinary input, a
  promise the screen makes that the code does not keep ("saved" before it is).
- **Irreversible loss**: work deleted or overwritten with no way back.
- **False refusals**: a new check that blocks honest use. It does as much damage
  as the hole it closes, and it is under-reported.
- **Documentation that states something untrue**: the next reader acts on it.

## Do not report these as blockers

- **Theoretical sequences nobody can reach**, or that need a trusted person to act
  against their own project. Name them in one line, marked "theoretical".
- **Anything whose worst outcome is "do it again"**: one repeated click, a reload.
- **A second guard on a boundary that already holds.** One correct check is
  enough; a second one can drift and disagree with the first.
- **Hypothetical scale**: what breaks at a million users, for an app with ten.
- **Machinery nobody asked for**: rate limits, retries, locks, versioning.

## Format

Every finding says: the concrete sequence (file, line, input, what happens),
whether it is **observed or theoretical**, what the bad outcome **costs**, and
whether it is **reversible**. A blocker without a sequence a real user could
execute is a note.

## Declining is a decision

When the author declines a finding, the reason goes in the pull request: which
of the cases above it is. Silence is not a decision.
