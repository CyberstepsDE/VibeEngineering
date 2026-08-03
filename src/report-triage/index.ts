import { buildReportQueue } from './queue'
import type { ReportQueue } from './types'

export type {
  PhishingReport,
  ReportQueue,
  SubmitReportInput,
  Verdict,
  VerdictFilter,
} from './types'
export { nextVerdicts, VERDICTS } from './transitions'

export function createReportQueue(): ReportQueue {
  return buildReportQueue({
    storage: window.localStorage,
    createId: () => crypto.randomUUID(),
    now: () => new Date(),
  })
}
