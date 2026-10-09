#!/usr/bin/env bash
# Human-in-the-loop reproduction loop.
# Copy this file, edit the steps below, and run it.
# The agent runs the script; the user follows prompts in their terminal.
#
# Usage:
#   bash hitl-loop.template.sh
#
# Two helpers:
#   step "<instruction>"          → show instruction, wait for Enter
#   capture VAR "<question>"      → show question, read response into VAR
#
# At the end, captured values are printed as KEY=VALUE for the agent to parse.
#
# `capture` prints its value back to the terminal, where the agent reads it,
# so capture observations, and leave signing in to the user as a `step`.

set -euo pipefail

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [Enter when done] " _
  # Swallow anything still queued, so nothing pasted here reaches the parent shell.
  while IFS= read -r -t 1 _; do :; done
}

capture() {
  local var="$1" question="$2" answer
  printf '\n>>> %s\n' "$question"
  read -r -p "    > " answer
  # A multi-line paste arrives line by line: keep reading until it stops, so the
  # whole answer is captured and no line is left for the parent shell to run.
  local more
  while IFS= read -r -t 1 more; do answer="$answer $more"; done
  printf -v "$var" '%s' "$answer"
}

# --- edit below ---------------------------------------------------------

step "Open the app at http://localhost:3000 and sign in."

capture ERRORED "Click the 'Export' button. Did it throw an error? (y/n)"

capture ERROR_MSG "Paste the error message (or 'none'):"

# --- edit above ---------------------------------------------------------

printf '\n--- Captured ---\n'
printf 'ERRORED=%s\n' "$ERRORED"
printf 'ERROR_MSG=%s\n' "$ERROR_MSG"
