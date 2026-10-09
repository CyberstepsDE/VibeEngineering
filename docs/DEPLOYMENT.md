# Putting a project online

> **Audience:** the agent, and the person it works with.
> **Load this when:** the person decides their project should run somewhere other
> than their own machine. Until then nothing here applies.

## Local first

Every project made from this template starts local: the app runs on the person's
machine, changes are reviewed and merged into `main` on that machine, and secrets
live only in `.env`. There is no server, no staging and no pipeline to set up.
That is a complete way to work, not a stage to rush through.

Never connect a host, create cloud resources, add a remote or deploy unless the
person asked for it. Each of those is their decision, made when they want it.

## Going online: the rules that do not depend on the host

1. **The person chooses the host.** Ask which one they want; if they have none in
   mind, offer two or three that fit the app (a static page, a server, a database)
   with a recommendation. Read the host's current documentation before every step
   (`rules/facts-only.md`); do not work from memory.
2. **A project people rely on gets a staging environment before production.** The
   same code is deployed first to a place nobody depends on, with its own secrets
   and its own data, never the production database. A change reaches production
   only after it was seen working there.
3. **Secrets live in the host's settings**, separately for staging and
   production, never in the repository (`rules/secrets.md`).
4. **Production changes only on the person's explicit "go".**
5. **After a deploy, check what is actually running**: the address responds, and
   it serves the version you meant to ship (`rules/what-checks-prove.md`).

A project online usually also lives on GitHub, so pull requests get the CI checks
in `.github/workflows/ci.yml` (`AGENTS.md` section 3).

## Option: Vercel

Vercel builds the production branch (usually `main`) as Production, and every
push to any other branch as a separate Preview deployment with its own address.
Environment variables are set per environment (Production, Preview,
Development), so Preview can serve as staging: give Preview its own secrets and
its own data. Source: vercel.com/docs/environment-variables.

First-time setup, run by the agent: `npx vercel login` (the person confirms the
sign-in in the browser), then `npx vercel link`. After that it depends on the
project kind (`AGENTS.md` section 3):

- **Local project** (no `origin` of their own): nothing is connected to git.
  `npx vercel` deploys the current folder as a Preview, and `npx vercel --prod`
  as Production, each run by the agent on the person's "go". Never run
  `vercel git connect` here: it takes the repository from the local git config,
  which would be the template's.
- **Project on GitHub**: `npx vercel git connect` connects their own repository,
  and from then on every push builds. `docs/LAB.md` Stage 0, Steps 3 and 4 walk
  through this on a worked example.

## Other hosts

The rules above stay the same. Read the host's documentation, agree the steps
with the person, and once a step has worked, write it here under the host's own
heading, so the next session does not have to rediscover it.
