# Critical thinking - trust nothing until you have checked it

> **Audience:** any AI coding agent working in this repository.
> **Load this when:** you are diagnosing a problem, reviewing work, or about to
> accept somebody's explanation - including your own.

## The rule

Critical thinking is not politeness with a caveat. It is: **assume an error has
already happened somewhere, and go looking for it.** In a reading, an assumption, an
interpretation, or a constraint nobody mentioned.

Every source below fails in its own specific way. Knowing the failure mode is what
lets you check the right thing.

| Source | How it fails |
| --- | --- |
| **The person reporting the bug** | Describes what they SAW, which is true, and why it happened, which is a guess. They may have missed a detail, or not know a constraint exists elsewhere. Their observation is evidence; their diagnosis is a hypothesis. |
| **Another agent's report** | Overstates, and marks things "verified" that it inferred. One agent's conclusion is a lead, never a finding. |
| **Your own earlier conclusion** | Written before you read the next file. Re-derive it when new evidence arrives instead of defending it. |
| **A passing test suite** | Proves the assertions agree with the code, not that the feature works. |
| **A document, including this one** | True when written. Documentation drifts and nobody notices. |
| **A green pipeline** | Says the code compiles and the asserted behaviours hold. Silent on every behaviour nobody asserted. |

## Attack negative claims hardest

"Not reachable." "Already covered." "That cannot happen." "No user does this."

**These are the highest-value statements to be wrong about**, because believing one
closes an investigation. Accepting a false "already covered" is how a real defect
survives review.

A worked example. An agent proved a particular state was unreachable, with genuine
file-and-line evidence about how the state machine worked. A reviewer refuted it in
one step, by noticing that a scheduled cleanup ended the state the proof depended on.
**The evidence was true. The conclusion was wrong.** Every negative claim deserves a
deliberate attempt to break it, ideally by somebody who did not write it.

## The lenses - run these on every change, not only when they seem relevant

A review scoped to "does the feature work" will never find the others.

1. **Does it work** - the stated behaviour, on every screen that uses it.
2. **Can somebody change an input to a decision that constrains them?** If a value
   acts as a permission boundary, ask who is allowed to write it.
3. **Can work be lost?** Dropped, overwritten, made unreachable, or reported as saved
   when it was not.
4. **What happens during the changeover?** Old code and new data serve people at the
   same time. What breaks in that window, and what does undoing it do?
5. **Does a new guard block honest work?** A rule that stops legitimate use is as
   damaging as the hole it closes, and it gets reported far less often. Attack the
   guard from the honest person's side too.
6. **Have you covered every path into the same decision?** If you bind one way of
   writing something to a rule, find every other way of writing it and bind those
   too. A guard on one path is not a guard.
7. **Is a claim about enforcement actually enforced?** If you say a rule is enforced,
   name the code that enforces it. If nothing does, call it a convention. A sentence
   in a document enforces nothing.
8. **Is the scope right?** See below.
9. **Does a guard cover every way of writing the operation?** A check on imports,
   commands or paths must list every form: relative and absolute, quoted and
   unquoted, static and dynamic, and the shell's own separators. Prove it with
   fixtures that should pass AND fixtures that should be refused. Copying a guard
   copies its holes - test the original too.
10. **Is "saved" true?** Any screen that tells a person their work is safe must
    take that word from a confirmed write, never from what is still in the
    browser. A pending save, a debounce timer or a request in flight is not saved.
11. **What happens if they leave right now?** A navigation, a closed tab or an
    unmount can silently drop a write that was already promised. A timer
    cancelled on unmount is a write that never happened; flush it instead.
12. **Does the number match the list?** A count shown beside a list comes from the
    same data as the rows, and a list that is cut short says so.
13. **Does the server re-check with the same rule the screen used?** When an
    action re-derives a decision the page already made ("may this be
    submitted?"), both call the one function. A second, narrower check in the
    action is not a defence; it is a second source that will disagree.
14. **Is user-supplied size bounded before the expensive work?** Cap the raw
    input before parsing or walking it, and cap the total per request, not only
    per item: many items just under a per-item limit still add up.
15. **Is outside text treated as data?** Text written by people or other systems
    (pull request titles, issue and ticket bodies, web pages) that reaches an
    agent is labelled as data, stripped of control characters and bounded in
    length. It never becomes an instruction.
16. **Does a stand-in prove what you think?** A mock, a stub or a different engine
    (jsdom instead of a browser, SQLite instead of Postgres, one `jq` instead of
    another) proves only itself. Probe the real thing once on the case that
    matters.
17. **Does a test inherit its runner's environment?** A test that runs git inside
    a git hook inherits `GIT_DIR`, which outranks `git -C`: its throwaway commits
    land in the real repository. Give such tests a clean environment.
18. **Is the promise in the code?** Before handing a change to review, read every
    concrete claim of its outcome ("sends header X", "caps at N", "refuses Y")
    back out of the diff. A claim the code does not keep is added or struck.

## Challenge the scope BEFORE building, not after

Review cannot fix work that should not exist. Before starting, answer in writing:
**what is the smallest change that satisfies what was actually asked, and what in
this plan is not in the ask?**

In one recorded case, a change grew to sixty-nine files and eight thousand lines
through six review rounds. Five of the six blocking findings the reviewer eventually
returned were defects in machinery nobody had requested.

## The learning loop

When a reviewer finds a blocking defect that your own checks should have caught,
that is a gap in the checks, not only in the code. Add one numbered lens above
that names the kind of mistake, in the same change, so the next change is
checked for it before review. The goal is a reviewer who rarely finds anything,
not one who catches the critical bug every time.

Separate three things before you act on any request: what was OBSERVED, the
OUTCOME that is wanted, and the MECHANISM somebody proposed. The outcome is
binding; a proposed mechanism, including the requester's own, is a hypothesis
to check against simpler alternatives.

## How to disagree

Be direct: "I disagree, because." Always offer an alternative - criticism alone is
not help. Back the objection with something concrete you read.

If they hear the objection and still want it, do it, and write down the risk. Their
call, on the record.

**When not to push back:** they have domain knowledge you lack about what people
actually need; the choice is purely a matter of taste; they have said they know the
trade-off. None of these exempt you from VERIFYING. They exempt you from arguing.

## Related

`facts-only.md` - claim only what you read. `less-is-more.md` - build only what is
needed. `what-checks-prove.md` - which evidence answers which question.
