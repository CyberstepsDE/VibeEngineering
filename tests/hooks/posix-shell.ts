// The hooks and scripts under test are POSIX shell scripts. On Windows they run
// in Git for Windows' shell, which is NOT on PATH when npm starts from
// PowerShell or cmd (Codex runs every command in PowerShell there): Git's
// installer adds only its cmd folder by default, and a `bash` that is found
// there may be WSL's. Git knows where it lives: `git --exec-path` prints
// <git>/mingw64/libexec/git-core, and <git>/bin/bash.exe and sh.exe are the
// launchers that put Git's Unix tools on PATH before they start the shell
// (gitforwindows.org/git-wrapper).

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export function posixShell(name: 'bash' | 'sh'): string {
  if (process.platform !== 'win32') return name
  const gitCore = execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim()
  const launcher = join(gitCore, '..', '..', '..', 'bin', `${name}.exe`)
  return existsSync(launcher) ? launcher : name
}
