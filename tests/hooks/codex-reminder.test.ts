// The critical-thinking reminder for Codex (.codex/hooks.json).
//
// Codex runs a hook in the shell it runs commands in: on Windows that is
// PowerShell (pwsh when it is on PATH, otherwise Windows PowerShell 5.1, the
// one every Windows has), started with -NoProfile -Command; /bin/sh does not
// exist there. So the hook has a commandWindows that reads the reminder line
// out of the same script. This checks that it prints exactly what the script
// prints, with the PowerShell this machine has; without one, it is skipped.

import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { posixShell } from './posix-shell.ts'

type CodexHooks = { hooks: { UserPromptSubmit: { hooks: { commandWindows?: string }[] }[] } }
const config = JSON.parse(readFileSync(join(process.cwd(), '.codex/hooks.json'), 'utf8')) as CodexHooks
const commandWindows = config.hooks.UserPromptSubmit[0]?.hooks[0]?.commandWindows ?? ''

const POWERSHELL = process.platform === 'win32' ? 'powershell.exe' : 'pwsh'
const hasPowerShell = spawnSync(POWERSHELL, ['-NoProfile', '-Command', 'exit 0']).status === 0

describe.runIf(hasPowerShell)('Codex reminder on Windows (commandWindows)', { timeout: 30_000 }, () => {
  it('prints the same reminder as the script, from a subfolder too', () => {
    const expected = execFileSync(posixShell('sh'), ['.claude/hooks/critical-thinking-reminder.sh'], {
      input: '{}',
      encoding: 'utf8',
    }).trim()
    const printed = execFileSync(POWERSHELL, ['-NoProfile', '-Command', commandWindows], {
      cwd: join(process.cwd(), 'src'),
      input: '{"hook_event_name":"UserPromptSubmit","prompt":"hi"}',
      encoding: 'utf8',
    }).trim()
    expect(expected).toMatch(/^CRITICAL THINKING:/)
    expect(printed).toBe(expected)
  })
})
