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

export const VERDICTS = Object.keys(TRANSITIONS) as Verdict[]

export function nextVerdicts(current: Verdict): Verdict[] {
  return [...TRANSITIONS[current]]
}

export function assertTransition(current: Verdict, next: Verdict): void {
  if (!TRANSITIONS[current].includes(next)) {
    throw new Error(`Cannot move a report from "${current}" to "${next}".`)
  }
}
