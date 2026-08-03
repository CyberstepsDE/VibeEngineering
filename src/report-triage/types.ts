export type Verdict = 'New' | 'Investigating' | 'Phishing'
export type VerdictFilter = 'All' | Verdict

export type PhishingReport = Readonly<{
  id: string
  sender: string
  subject: string
  note: string
  receivedAt: string
  verdict: Verdict
  createdAt: string
  verdictSetAt: string | null
}>

export type SubmitReportInput = Readonly<{
  sender: string
  subject: string
  note: string
  receivedAt: string
}>

export type ReportQueue = Readonly<{
  list: (filter?: VerdictFilter) => PhishingReport[]
  submit: (input: SubmitReportInput) => PhishingReport
  setVerdict: (id: string, verdict: Verdict) => PhishingReport
}>
