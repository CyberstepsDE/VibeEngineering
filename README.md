# Cybersteps Training Starter

A template you clone before building anything. It does not contain an application.
What it contains is a **way of working with an AI coding agent**: a checked-in set
of instructions, plus the linter, test runner and CI setup those instructions
assume - already wired together and already proven to run.

## What this is

Normally a starter template gives you a working app to delete pieces of. This one is
the opposite: there is no app yet. What is here instead is everything that stays true
no matter what you end up building - the rules an agent follows, the commands that
check its work, and the automation that runs those commands on every change.

You bring the idea. The agent asks you questions about it, writes a short plan, and
builds it inside this same structure, one verified step at a time.

## What is inside

```text
.
├── AGENTS.md            - the rules an AI agent reads before doing anything here
├── CLAUDE.md             - a one-line pointer so Claude Code also reads AGENTS.md
├── rules/                - the detail behind AGENTS.md, one topic per file
├── .claude/skills/       - the /start, /grill-me and /save commands the rules refer to
├── .github/workflows/    - the automated check that runs on every proposed change
├── src/                  - the application (today: a one-page placeholder)
└── tests/                - the automated tests (today: one placeholder per kind)
```

A few words that are worth defining once:

- **Agent** - the AI tool doing the typing (Claude Code, Codex, or similar). You
  talk to it in plain language; it reads and writes the files above.
- **AGENTS.md** - the file an agent is expected to read first, every time. It is
  short on purpose, and points to `rules/` for anything longer.
- **A skill** (in `.claude/skills/`) - a named routine you trigger by typing its
  name, like `/start`. It is a script written in plain English for the agent to
  follow, not a program.
- **CI** (Continuous Integration, in `.github/workflows/`) - a robot that repeats
  the same checks on every change, so nobody has to remember to run them by hand.

## How to start

You need [Node.js](https://nodejs.org) 22.12 or newer. If you use `nvm` (a tool for
switching Node versions), run `nvm use` in this folder and it picks the right one
automatically, from `.nvmrc`.

1. Clone this repository, then move into the folder it created:
   ```bash
   git clone <this repository's URL>
   cd <repository-folder-name>
   ```
2. Install its dependencies (the libraries the toolchain needs - a one-time step,
   or whenever they change):
   ```bash
   npm ci
   ```
3. Open the folder in your AI coding agent.
4. Type `/start`.

That last command is the whole trick. It reads `AGENTS.md`, checks that the project
still runs, and reports back what it found instead of guessing. From there, tell it
in your own words what you want to build - it will interview you before writing any
code.

## The finished example

This repository has a second branch, `example`, which was never stripped down. It
holds a small, complete application - a phishing-report triage queue - built through
this exact same workflow from start to finish. Look there to see what a finished
change, reviewed and passing every check, actually looks like:

```bash
git switch example
npm run verify
```
