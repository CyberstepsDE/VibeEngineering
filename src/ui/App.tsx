import { FormEvent, useMemo, useState } from 'react'
import {
  createReportQueue,
  nextVerdicts,
  VERDICTS,
  type PhishingReport,
  type Verdict,
  type VerdictFilter,
} from '../report-triage'

const FILTERS: readonly VerdictFilter[] = ['All', ...VERDICTS]

function verdictSlug(verdict: string): string {
  return verdict.toLowerCase().replace(/\s+/g, '-')
}

export function App() {
  const queue = useMemo(() => createReportQueue(), [])
  const [filter, setFilter] = useState<VerdictFilter>('All')
  const [reports, setReports] = useState<PhishingReport[]>(() => queue.list())
  const [sender, setSender] = useState('')
  const [subject, setSubject] = useState('')
  const [note, setNote] = useState('')
  const [receivedAt, setReceivedAt] = useState('')
  const [error, setError] = useState('')

  function refresh(nextFilter = filter) {
    setReports(queue.list(nextFilter))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      queue.submit({ sender, subject, note, receivedAt })
      setSender('')
      setSubject('')
      setNote('')
      setReceivedAt('')
      setError('')
      refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit report.')
    }
  }

  function changeFilter(next: VerdictFilter) {
    setFilter(next)
    refresh(next)
  }

  function setVerdict(id: string, verdict: Verdict) {
    queue.setVerdict(id, verdict)
    refresh()
  }

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">CyberSteps classroom prototype</p>
        <h1>Phishing Report Triage</h1>
        <p>
          Classroom prototype only, stored in this browser. Do not enter a real
          or sensitive phishing report - use invented examples.
        </p>
      </header>

      <section className="workspace" aria-labelledby="report-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Reported emails</p>
            <h2 id="report-heading">Triage queue</h2>
          </div>
          <strong aria-live="polite">{reports.length} shown</strong>
        </div>

        <form onSubmit={submit} className="composer">
          <div className="field">
            <label htmlFor="report-sender">Sender</label>
            <input
              id="report-sender"
              value={sender}
              onChange={(event) => setSender(event.target.value)}
              placeholder="e.g. IT Support <helpdesk@company-verify.example>"
              maxLength={200}
            />
          </div>
          <div className="field">
            <label htmlFor="report-subject">Subject</label>
            <input
              id="report-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Your password expires today"
              maxLength={200}
            />
          </div>
          <div className="field">
            <label htmlFor="report-received-at">Date received</label>
            <input
              id="report-received-at"
              type="date"
              value={receivedAt}
              onChange={(event) => setReceivedAt(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="report-note">Note (optional)</label>
            <textarea
              id="report-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What made this look suspicious?"
              maxLength={500}
            />
          </div>
          <button type="submit">Report email</button>
          {error && <p className="error" role="alert">{error}</p>}
        </form>

        <div className="filters" aria-label="Filter reports">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => changeFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>

        {reports.length === 0 ? (
          <div className="empty">
            <h3>No reports match this filter.</h3>
            <p>Choose another filter or report a suspicious email.</p>
          </div>
        ) : (
          <ul className="report-list">
            {reports.map((report) => (
              <li key={report.id}>
                <div>
                  <span className={`status status-${verdictSlug(report.verdict)}`}>
                    {report.verdict}
                  </span>
                  <p className="subject">{report.subject}</p>
                  <p className="meta">
                    From {report.sender} - received {report.receivedAt}
                  </p>
                  {report.note && <p className="note">{report.note}</p>}
                </div>
                <div className="actions">
                  {nextVerdicts(report.verdict).map((verdict) => (
                    <button
                      key={verdict}
                      type="button"
                      className="secondary"
                      onClick={() => setVerdict(report.id, verdict)}
                      aria-label={`Mark as ${verdict}: ${report.subject}`}
                    >
                      Mark as {verdict}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>
        Classroom prototype. Data stays in this browser only. Never enter a
        real or sensitive phishing report.
      </footer>
    </main>
  )
}
