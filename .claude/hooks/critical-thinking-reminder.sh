#!/bin/sh
# UserPromptSubmit reminder for both Claude Code (.claude/settings.json) and Codex
# (.codex/hooks.json). Both add this hook's plain output to the model's context
# for the message being answered. It never blocks. Keep it short: it is read on
# every single message. Detail: rules/critical-thinking.md.
cat >/dev/null

cat <<'EOF'
CRITICAL THINKING: the person's desired outcome is binding; any proposed implementation, including theirs, is a hypothesis. Before changing anything, separate what was observed, the outcome wanted and the mechanism proposed; check the repository and primary sources; compare with the simplest alternative; say so when you disagree or are unsure. Do exactly what was asked - a doubt is a question, not an improvement.
EOF
