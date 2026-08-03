import { buildReportQueue } from './queue'
import type { ReportQueue } from './types'

export function createReportQueueForTest(options: {
  storage: Storage
  createId: () => string
  now: () => Date
}): ReportQueue {
  return buildReportQueue(options)
}
