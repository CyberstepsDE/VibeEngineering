#!/bin/sh
# PreToolUse[Write|Edit] guard for Claude Code: asks the person before the agent
# changes a file that defines one of the project's checks. An agent under
# pressure to make a check pass is tempted to weaken the check instead of fixing
# the code; AGENTS.md section 3 forbids that, and this makes it visible.
#
# It never refuses on its own. It answers "ask", so Claude Code shows the person
# a permission prompt (even in auto mode) with the reason below; a change they
# asked for goes through with one click. Silent output means "no decision": the
# normal permission flow continues.
#
# Honest limits: Claude Code only (Codex and a human terminal never run it); only
# the Write and Edit tools, so a shell command that edits these files is not
# seen; without jq it lets everything through. package.json is left out on
# purpose: it changes with every new dependency.

command -v jq >/dev/null 2>&1 || exit 0
path=$(jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
[ -n "$path" ] || exit 0
# Claude Code on Windows sends backslash-separated paths; match them the same way.
path=$(printf '%s' "$path" | tr '\\' '/')

guarded=0
case "$path" in
  .github/workflows/* | */.github/workflows/* | .githooks/* | */.githooks/* | .claude/hooks/* | */.claude/hooks/* | .claude/settings*.json | */.claude/settings*.json | .codex/* | */.codex/*) guarded=1 ;;
  scripts/review.sh | */scripts/review.sh | scripts/check-reviews.sh | */scripts/check-reviews.sh | scripts/read-review-verdict.sh | */scripts/read-review-verdict.sh) guarded=1 ;;
esac
case "${path##*/}" in
  eslint.config.* | .eslintrc* | .prettierrc* | prettier.config.* | tsconfig*.json | vite.config.* | vitest.config.* | playwright.config.* | .gitleaks.toml | .nvmrc) guarded=1 ;;
esac
[ "$guarded" = 1 ] || exit 0

jq -cn --arg file "$path" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "ask",
    permissionDecisionReason: ("The agent wants to change " + $file + ", which defines one of the project'"'"'s checks (lint, types, tests, CI, git hooks or the agent'"'"'s own guards). Approve only if you asked for this change: weakening a check to make it pass is never the fix (AGENTS.md section 3).")
  }
}'
