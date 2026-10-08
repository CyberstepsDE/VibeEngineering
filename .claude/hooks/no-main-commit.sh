#!/usr/bin/env bash
# PreToolUse[Bash] guard: never commit on the main branch.
#
# AGENTS.md section 3 is explicit - work happens on a short-lived branch, never
# straight on main. This hook is the code that makes that a rule instead of a
# request, for one tool: Claude Code. Codex, Cursor and a human typing in a
# terminal never run it - for them the rule binds by being read. Honesty about
# what a guard actually covers is part of the guard.
#
# WHICH REPOSITORY A COMMIT TARGETS. A guard must enumerate every syntactic form
# of the operation it restricts: `cd <dir> && git commit`, `git -C <dir> commit`,
# `git --git-dir=<dir>/.git --work-tree=<dir> commit` and a bare `git commit`.
# A bare commit is judged from the SESSION's directory, which the event carries
# as `cwd`. The hook process itself runs in the project folder, and in a desktop
# app session that is not where the session works (each session has its own
# worktree), so judging the process directory refuses honest work.
#
# EXIT CODES MATTER: in Claude Code hooks, ONLY exit 2 blocks the action.
# Exit 1 is a non-blocking error and the action proceeds. Fails OPEN by design:
# an unparseable payload, or a directory the hook cannot resolve (a shell
# variable such as "$DIR"), must never become an unexplained refusal.
# Fixtures: tests/hooks/no-main-commit.test.ts.

set -uo pipefail

input=$(cat)

# Relative paths and the no-path case are judged from the session's directory.
event_dir=$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)
if [ -n "$event_dir" ] && [ -d "$event_dir" ]; then cd "$event_dir" || exit 0; fi

# Fast reject only - NOT the decision: "commit" somewhere after "git". Read-only
# commands that merely contain the word (`git cat-file -e <sha>^{commit}`,
# `git log --grep=commit`, `git commit-graph`) are filtered out below, where
# "commit" must be the actual subcommand. Quotes may stand in between, so
# `git -C "<dir>" commit` reaches the decision.
printf '%s' "$input" | grep -qE '\bgit\b[^;|&]*\bcommit\b' || exit 0

# Only the command is read - never the tool's description or anything else in
# the event. jq unescapes the JSON string, so a quoted path arrives as written;
# the sed line is the fallback when jq is missing.
command_line=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)
[ -n "$command_line" ] || command_line=$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p' | awk 'NR==1')
[ -n "$command_line" ] || command_line=$input

# Is "commit" the git SUBCOMMAND - the first token after "git" that does not
# start with "-"? -C and -c take their value as a separate next token, so that
# token is skipped too; every other global option is one self-contained token.
is_commit_invocation() {
  local segment="$1"
  local -a tokens
  read -ra tokens <<< "$segment"
  local n=${#tokens[@]}
  [ "${tokens[0]:-}" = "git" ] || return 1
  local i=1
  while [ "$i" -lt "$n" ]; do
    case "${tokens[$i]}" in
      -C | -c) i=$((i + 2)) ;;
      -*) i=$((i + 1)) ;;
      *) break ;;
    esac
  done
  [ "${tokens[$i]:-}" = "commit" ]
}

# A command line can chain several invocations (`cd x && git commit`).
is_commit_line() {
  local line="$1" seg
  while read -r seg; do
    is_commit_invocation "$seg" && return 0
  done < <(printf '%s\n' "$line" | sed -E 's/(&&|\|\||;|\|)/\n/g')
  return 1
}

is_commit_line "$command_line" || exit 0

# The path a form names, with one optional leading quote. A form that is present
# but names nothing resolvable makes the target unknowable: print nothing, and
# the caller fails open instead of judging some other directory.
form_path() {
  local line="$1" pattern="$2"
  # The leading space lets a pattern that needs a separator match at the start.
  printf ' %s' "$line" | sed -n "s/.*${pattern}[\"']\{0,1\}\([^ \"';|&]*\).*/\1/p" | awk 'NR==1'
}

resolve_dir() {
  local line="$1" dir=""

  # Form 1: git -C <dir> ... commit   (also -C=<dir>)
  if printf '%s' "$line" | grep -qE '(^|[[:space:]])-C([[:space:]=]|$)'; then
    dir=$(form_path "$line" '[[:space:]]-C[[:space:]=]*')
    [ -n "$dir" ] && [ -d "$dir" ] && printf '%s' "$dir"
    return
  fi

  # Form 2: git --git-dir=<dir>/.git  -> the repository is its parent
  if printf '%s' "$line" | grep -q -- '--git-dir'; then
    dir=$(form_path "$line" '--git-dir[[:space:]=]*')
    dir=${dir%/.git}
    [ -n "$dir" ] && [ -d "$dir" ] && printf '%s' "$dir"
    return
  fi

  # Form 3: --work-tree=<dir>
  if printf '%s' "$line" | grep -q -- '--work-tree'; then
    dir=$(form_path "$line" '--work-tree[[:space:]=]*')
    [ -n "$dir" ] && [ -d "$dir" ] && printf '%s' "$dir"
    return
  fi

  # Form 4: a `cd <dir>` before the commit
  if printf '%s' "$line" | grep -qE '(^|[;&|[:space:]])cd[[:space:]]'; then
    dir=$(form_path "$line" '[;&|[:space:]]cd[[:space:]]\{1,\}')
    [ -n "$dir" ] && [ -d "$dir" ] && printf '%s' "$dir"
    return
  fi

  # Form 5: none of the above - the session's working directory.
  printf '%s' "$(pwd)"
}

dir=$(resolve_dir "$command_line")
[ -n "$dir" ] || exit 0
branch=$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0
[ -n "$branch" ] || exit 0

if [ "$branch" = "main" ]; then
  echo "BLOCKED (AGENTS.md section 3): HEAD in $dir is on 'main' - work belongs on a branch. Run: git switch -c <branch-name>, then commit." 1>&2
  exit 2
fi

exit 0
