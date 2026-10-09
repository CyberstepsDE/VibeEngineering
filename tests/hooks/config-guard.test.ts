// Fixtures for the PreToolUse[Write|Edit] guard in .claude/hooks/config-guard.sh.
//
// The guard answers "ask" for a file that defines one of the project's checks
// and stays silent for everything else. Both halves are pinned: a guard that asks
// about ordinary files is as broken as one that never asks.

import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const HOOK = join(process.cwd(), '.claude/hooks/config-guard.sh')

function decision(toolInput: Record<string, unknown>): string {
  const out = execFileSync('sh', [HOOK], {
    input: JSON.stringify({ cwd: '/work/app', tool_name: 'Edit', tool_input: toolInput }),
    encoding: 'utf8',
  })
  if (out.trim() === '') return 'silent'
  return JSON.parse(out).hookSpecificOutput.permissionDecision as string
}

describe('config-guard asks before a check changes', () => {
  it.each([
    '/work/app/eslint.config.js',
    '/work/app/tsconfig.app.json',
    '/work/app/tsconfig.json',
    '/work/app/vite.config.ts',
    '/work/app/playwright.config.ts',
    '/work/app/.prettierrc.json',
    '/work/app/.github/workflows/ci.yml',
    '/work/app/.githooks/pre-push',
    '/work/app/.claude/hooks/no-main-commit.sh',
    '/work/app/.claude/settings.json',
    '/work/app/.claude/settings.local.json',
    '/work/app/.codex/hooks.json',
    '/work/app/scripts/review.sh',
    '.githooks/pre-commit',
    'C:\\work\\app\\eslint.config.js',
    'C:\\work\\app\\.github\\workflows\\ci.yml',
  ])('asks for %s', (file) => {
    expect(decision({ file_path: file, old_string: 'a', new_string: 'b' })).toBe('ask')
  })

  it('names the file in the reason the person sees', () => {
    const out = execFileSync('sh', [HOOK], {
      input: JSON.stringify({ tool_input: { file_path: '/work/app/eslint.config.js' } }),
      encoding: 'utf8',
    })
    expect(JSON.parse(out).hookSpecificOutput.permissionDecisionReason).toContain(
      '/work/app/eslint.config.js',
    )
  })
})

describe('config-guard stays silent for ordinary work', () => {
  it.each([
    '/work/app/src/main.ts',
    '/work/app/package.json',
    '/work/app/README.md',
    '/work/app/tests/smoke.test.ts',
    '/work/app/docs/eslint-notes.md',
    'C:\\work\\app\\src\\main.ts',
  ])('says nothing for %s', (file) => {
    expect(decision({ file_path: file, content: 'x' })).toBe('silent')
  })

  it('says nothing for an event without a file path', () => {
    expect(decision({ command: 'npm run verify' })).toBe('silent')
  })
})
