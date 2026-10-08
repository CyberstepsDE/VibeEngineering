---
name: review
description: Run the two review passes (logic, security) on the committed branch before it merges, by a mind that did not write it - Codex for Claude-written work and the other way round. Use after committing and before marking a pull request ready or merging it, and again after every fix.
---

# /review - two passes before the merge

Nothing merges on the word of the mind that wrote it. This runs both passes from
`AGENTS.md` section 3 on the exact commit you are about to merge.

## Only on work you trust

The script runs the branch's own `npm run verify` on this machine, with your
permissions. Use it on your work and your agents' work. Never check out and run a
branch from somebody you do not trust, such as a pull request from a fork: its
code would run as you. CI checks those on GitHub's machines, without your secrets,
and a person reads the diff before anything else.

## Step 1 - be reviewable

- Every change is committed. A review is of a commit, not of a working tree.
- The branch is rebased on the current `origin/main`.
- Write the **outcome** in one sentence, as the user would see it: "A visitor who
  submits an empty form sees which field is missing and nothing is saved." The
  reviewers judge the outcome first and the code second, so a vague outcome buys
  a vague review. Before you run anything, read every concrete claim in your
  outcome back out of the diff: a property the code does not have is either added
  or struck from the sentence.

## Step 2 - run both passes

```bash
scripts/review.sh <claude|codex|other> origin/main "<the outcome sentence>"
```

The first argument names who WROTE the change: `claude`, `codex`, or `other`
for another agent or a person working in this repository. The script:

1. runs `npm run verify` on this commit and stops if it fails;
2. runs the logic pass on the OTHER tool and the security pass on Codex (on
   Claude when Codex wrote the change), each
   following its instructions in `.claude/agents/`;
3. stores both transcripts and a manifest under
   `<git common dir>/review-evidence/<commit sha>/`, outside the repository files;
4. prints both verdicts and exits non-zero unless both say SHIP.

If the other tool is not installed, both passes run on the one you have and the
manifest says `same-tool`. That is weaker than an independent review; say so in
the pull request. With neither tool available, open a fresh agent session on the
branch and run the `reviewer`, then the `security-reviewer` agent by hand.

If a pass returns nothing, the tool is usually not logged in or its default
model is not available to your account: set `REVIEW_CODEX_MODEL` or
`REVIEW_CLAUDE_MODEL` and run again.

## Step 3 - act on the verdicts

- **Both SHIP**: put both verdict lines and the evidence path in the pull request,
  mark it ready, merge after CI is green.
- **NO-SHIP**: read every finding. Fix the real ones; a new commit has a new SHA,
  so run the review again - the old verdicts no longer apply.
- **Decline a finding only with a reason**, written in the pull request: it is
  theoretical (nobody can reach it), the cost is a reversible inconvenience, or it
  asks for machinery nobody needs. See `rules/review-calibration.md`. A declined
  finding is a decision, not an oversight.
- When a reviewer finds something your own checks should have caught, add one line
  to `rules/critical-thinking.md` naming that kind of mistake, so the next change
  is checked for it before review.

## What the push hook does with this

`.githooks/pre-push` checks for two SHIP verdicts on the commit you push and
prints a loud warning when they are missing. It never refuses: pushing a draft
is fine. Merging it unreviewed is the decision the warning makes visible.
