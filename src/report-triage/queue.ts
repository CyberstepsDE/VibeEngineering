import { createReportRepository } from './repository'
import { assertTransition } from './transitions'
import type { PhishingReport, ReportQueue, SubmitReportInput, VerdictFilter } from './types'
import {
  normalizeNote,
  normalizeReceivedDate,
  normalizeSender,
  normalizeSubject,
} from './validation'

export type ReportQueueDependencies = Readonly<{
  storage: Storage
  createId: () => string
  now: () => Date
}>

export function buildReportQueue({
  storage,
  createId,
  now,
}: ReportQueueDependencies): ReportQueue {
  const repository = createReportRepository(storage)

  return {
    list(filter: VerdictFilter = 'All') {
      const reports = repository.read()
      return filter === 'All' ? reports : reports.filter((report) => report.verdict === filter)
    },

    submit(input: SubmitReportInput) {
      const report: PhishingReport = {
        id: createId(),
        sender: normalizeSender(input.sender),
        subject: normalizeSubject(input.subject),
        note: normalizeNote(input.note),
        receivedAt: normalizeReceivedDate(input.receivedAt),
        verdict: 'New',
        createdAt: now().toISOString(),
        verdictSetAt: null,
      }
      repository.write([report, ...repository.read()])
      return report
    },

    setVerdict(id, verdict) {
      const reports = repository.read()
      const current = reports.find((report) => report.id === id)

      if (!current) throw new Error('Report not found.')
      if (current.verdict === verdict) return current

      assertTransition(current.verdict, verdict)

      const updated: PhishingReport = {
        ...current,
        verdict,
        verdictSetAt: now().toISOString(),
      }
      repository.write(reports.map((report) => (report.id === id ? updated : report)))
      return updated
    },
  }
}
