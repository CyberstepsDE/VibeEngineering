// Regression test for the local fix in
// .claude/skills/diagnosing-bugs/scripts/hitl-loop.template.sh.
//
// A person answers the script's prompts in their own terminal. When they paste a
// multi-line error, the upstream script read only the first line and left the
// rest queued, and the parent shell then ran those lines as commands (reproduced
// in a real terminal, with and without a final Enter). The fixed script reads a
// paste to the end. Here a person is modelled as answers arriving one prompt at a
// time, the paste in one piece, and `cat` plays the parent shell: whatever it
// prints is what the shell would run.

import { spawn } from 'node:child_process'
import { join } from 'node:path'

import { expect, it } from 'vitest'

const SCRIPT = join(process.cwd(), '.claude/skills/diagnosing-bugs/scripts/hitl-loop.template.sh')

function answerLikeAPerson(paste: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', ['-c', 'bash "$1"; echo "--- left for the shell:"; cat', '_', SCRIPT])
    let out = ''
    child.stdout.on('data', (chunk: Buffer) => (out += chunk.toString()))
    child.on('error', reject)
    child.on('close', () => resolve(out))
    const answers = ['\n', 'y\n', paste]
    answers.forEach((answer, i) => setTimeout(() => child.stdin.write(answer), 1500 * (i + 1)))
    setTimeout(() => child.stdin.end(), 1500 * (answers.length + 1))
  })
}

it.each([
  ['ending with Enter', 'first line of error\ntouch MARKER\n'],
  ['without a final Enter', 'first line of error\ntouch MARKER'],
])('captures a multi-line paste %s whole and leaves nothing for the shell', async (_, paste) => {
  const out = await answerLikeAPerson(paste)
  expect(out).toContain('ERRORED=y')
  expect(out).toContain('ERROR_MSG=first line of error touch MARKER')
  expect(out.split('--- left for the shell:')[1].trim()).toBe('')
}, 15000)
