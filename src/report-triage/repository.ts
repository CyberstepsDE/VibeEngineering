import { VERDICTS } from './transitions'
import type { PhishingReport } from './types'

const STORAGE_KEY = 'phishing-triage.reports.v1'

export type ReportRepository = Readonly<{
  read: () => PhishingReport[]
  write: (reports: PhishingReport[]) => void
}>

function isVerdict(value: unknown): value is PhishingReport['verdict'] {
  return typeof value === 'string' && (VERDICTS as string[]).includes(value)
}

function isReport(value: unknown): value is PhishingReport {
  if (!value || typeof value !== 'object') return false
  const report = value as Record<string, unknown>
  return (
    typeof report.id === 'string' &&
    typeof report.sender === 'string' &&
    typeof report.subject === 'string' &&
    typeof report.note === 'string' &&
    typeof report.receivedAt === 'string' &&
    isVerdict(report.verdict) &&
    typeof report.createdAt === 'string' &&
    (report.verdictSetAt === null || typeof report.verdictSetAt === 'string')
  )
}

export function createReportRepository(storage: Storage): ReportRepository {
  return {
    read() {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return []

      try {
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter(isReport) : []
      } catch {
        return []
      }
    },
    write(reports) {
      storage.setItem(STORAGE_KEY, JSON.stringify(reports))
    },
  }
}
