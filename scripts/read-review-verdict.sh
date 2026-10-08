#!/bin/sh
# Read the verdict out of one review transcript. Prints SHIP, NO-SHIP or INVALID.
#
# Strict on purpose: a transcript carries EXACTLY ONE verdict line, and it is the
# LAST non-empty line. A looser check ("contains VERDICT: SHIP anywhere") reads a
# review that opens with a hopeful summary and closes with NO-SHIP as a pass.
# INVALID is never treated as SHIP: an unreadable review is a review that did
# not happen. Fixtures: tests/hooks/read-review-verdict.test.ts.
set -eu

file=${1:?Usage: read-review-verdict.sh <transcript>}
test -f "$file" || { echo INVALID; exit 0; }

verdict_lines=$(grep -c '^VERDICT: ' "$file" || true)
[ "$verdict_lines" = "1" ] || { echo INVALID; exit 0; }

last_line=$(sed -e 's/[[:space:]]*$//' "$file" | grep -v '^$' | tail -n 1)
case "$last_line" in
  "VERDICT: SHIP") echo SHIP ;;
  "VERDICT: NO-SHIP") echo NO-SHIP ;;
  *) echo INVALID ;;
esac
