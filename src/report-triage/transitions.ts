import type { Verdict } from './types'

// The one place that defines which verdict can follow another. Nothing else in
// this app - not the queue, not the user interface - decides this on its own;
// everything asks this table. Because it is typed as a Record over every member
// of `Verdict`, adding a verdict to that union without adding it here is a
// compile error, not a bug someone finds later.
const TRANSITIONS: Readonly<Record<Verdict, readonly Verdict[]>> = {
  New: ['Investigating'],
  Investigating: ['Phishing'],
  Phishing: [],
}

// The full list of verdicts, derived from the table above rather than typed out a
// second time. Deriving it is the point: a hand-written copy would be a second place
// to keep in sync, and this app has exactly one.
//
// About the `as Verdict[]` at the end, because it is the only cast in this codebase
// and it looks alarming: `Object.keys()` always hands back plain strings, even when
// the object it read has more specific keys. That is a deliberate limitation of the
// language, not a mistake here. We know the keys ARE verdicts, because the line above
// forces the table to have exactly one entry per verdict, so we say so. If you ever
// find yourself writing `as` somewhere else, stop and ask why - it is you telling the
// compiler to trust you, and you had better be right.
export const VERDICTS = Object.keys(TRANSITIONS) as Verdict[]

export function nextVerdicts(current: Verdict): Verdict[] {
  return [...TRANSITIONS[current]]
}

export function assertTransition(current: Verdict, next: Verdict): void {
  if (!TRANSITIONS[current].includes(next)) {
    throw new Error(`Cannot move a report from "${current}" to "${next}".`)
  }
}
