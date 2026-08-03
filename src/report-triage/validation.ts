const MIN_LENGTH = 3
const MAX_SENDER_LENGTH = 200
const MAX_SUBJECT_LENGTH = 200
const MAX_NOTE_LENGTH = 500
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function normalizeRequired(input: string, field: string, maxLength: number): string {
  const value = input.trim().replace(/\s+/g, ' ')

  if (value.length < MIN_LENGTH) {
    throw new Error(`${field} must be at least ${MIN_LENGTH} characters.`)
  }

  if (value.length > maxLength) {
    throw new Error(`${field} must be at most ${maxLength} characters.`)
  }

  return value
}

export function normalizeSender(input: string): string {
  return normalizeRequired(input, 'Sender', MAX_SENDER_LENGTH)
}

export function normalizeSubject(input: string): string {
  return normalizeRequired(input, 'Subject', MAX_SUBJECT_LENGTH)
}

export function normalizeNote(input: string): string {
  const value = input.trim().replace(/\s+/g, ' ')

  if (value.length > MAX_NOTE_LENGTH) {
    throw new Error(`Note must be at most ${MAX_NOTE_LENGTH} characters.`)
  }

  return value
}

export function normalizeReceivedDate(input: string): string {
  const value = input.trim()

  if (!DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error('Received date must be a valid date (YYYY-MM-DD).')
  }

  return value
}
