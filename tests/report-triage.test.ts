import { describe, expect, it } from 'vitest'
import { createReportQueueForTest } from '../src/report-triage/testing'
import { nextVerdicts } from '../src/report-triage/transitions'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

function setup() {
  let id = 0
  return createReportQueueForTest({
    storage: new MemoryStorage(),
    createId: () => `report-${++id}`,
    now: () => new Date('2026-08-02T10:00:00.000Z'),
  })
}

const VALID_INPUT = {
  sender: 'IT Support <helpdesk@company-verify.example>',
  subject: 'Your password expires today',
  note: 'Urgent tone and a login link I did not recognize.',
  receivedAt: '2026-08-01',
}

describe('report triage queue', () => {
  it('submits a normalized report as New', () => {
    const queue = setup()
    const report = queue.submit(VALID_INPUT)

    expect(report).toMatchObject({
      id: 'report-1',
      sender: VALID_INPUT.sender,
      subject: VALID_INPUT.subject,
      note: VALID_INPUT.note,
      receivedAt: VALID_INPUT.receivedAt,
      verdict: 'New',
      verdictSetAt: null,
    })
    expect(queue.list('New')).toEqual([report])
  })

  it('rejects a sender or subject outside the accepted length', () => {
    const queue = setup()
    expect(() => queue.submit({ ...VALID_INPUT, sender: 'x' })).toThrow('at least 3 characters')
    expect(() => queue.submit({ ...VALID_INPUT, subject: 'x'.repeat(201) })).toThrow(
      'at most 200 characters',
    )
  })

  it('rejects a missing or malformed received date', () => {
    const queue = setup()
    expect(() => queue.submit({ ...VALID_INPUT, receivedAt: '' })).toThrow('Received date')
    expect(() => queue.submit({ ...VALID_INPUT, receivedAt: 'not-a-date' })).toThrow(
      'Received date',
    )
  })

  it('moves a report through the New -> Investigating -> Phishing workflow', () => {
    const queue = setup()
    const report = queue.submit(VALID_INPUT)

    const investigating = queue.setVerdict(report.id, 'Investigating')
    expect(investigating.verdict).toBe('Investigating')
    expect(investigating.verdictSetAt).toBe('2026-08-02T10:00:00.000Z')

    const phishing = queue.setVerdict(report.id, 'Phishing')
    expect(phishing.verdict).toBe('Phishing')
    expect(queue.list('Phishing')).toEqual([phishing])
    expect(queue.list('New')).toHaveLength(0)
  })

  it('rejects a verdict change that skips the required workflow', () => {
    const queue = setup()
    const report = queue.submit(VALID_INPUT)

    expect(() => queue.setVerdict(report.id, 'Phishing')).toThrow(
      'Cannot move a report from "New" to "Phishing".',
    )
  })

  it('treats setting the same verdict again as a no-op', () => {
    const queue = setup()
    const report = queue.submit(VALID_INPUT)

    const unchanged = queue.setVerdict(report.id, 'New')
    expect(unchanged).toEqual(report)
  })
})

describe('nextVerdicts', () => {
  it('exposes only the verdicts reachable from the current one', () => {
    expect(nextVerdicts('New')).toEqual(['Investigating'])
    expect(nextVerdicts('Investigating')).toEqual(['Phishing'])
    expect(nextVerdicts('Phishing')).toEqual([])
  })
})
