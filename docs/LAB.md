# Lab: Build "Domain Security Check" From Zero

## What this is

A lab guide anyone can follow: solo at home, in a group, or in a class with one
person driving on a shared screen. There is no application here yet - just this
template, an agent, and a plain-language goal. That is the point, not an oversight.

**The goal, stated once:** a page where you type a domain name and get back whether
its email is protected against spoofing (SPF, DMARC, DKIM) and whether its website
sends the security headers browsers respect. Two checks, one page, no accounts, no
stored data.

Stage 0 plus the ten stages below are the shape of the session, not a script to
read aloud. Follow them in order; the words inside each "ask the agent" line are a
starting point, not a transcript.

## Stage 0: before you start (one-time setup, not a build step)

Ready before the build: this starter cloned fresh, `npm ci` already run so
`node_modules/` is warm, and a Vercel account (the free Hobby plan) connected to
the GitHub account that owns your repository. This is the account Stage 8 links
the project to - creating it cold in the middle of the lab eats the lab's best
minutes.

## Stage 1: `/start`, and tell the agent the goal

Open the template in the agent and type `/start` - nothing else yet. Let it read
`AGENTS.md`, confirm `npm run verify` is green on a template with no application
in it, and report back what it found - so you hear a tool describe its own
starting state instead of assuming one.

Once it reports, give it the goal in one sentence: a page that checks a domain's
email authentication and its website's security headers.

**Done looks like:** the agent has stated, in its own words, what this repository
currently is (a clean template, no app yet) and has repeated the goal back
correctly. It has not written any code.

**If it drags:** `/start` spends its time on `npm ci` and `npm run verify` - that
pause is productive, not dead air. On slow wifi, run `npm ci` before the session
so `node_modules/` is already warm.

## Stage 2: the agent interviews you (`/grill-me`)

Before it writes a line of code, it asks questions - answer as the person who
wants this tool, not as a programmer.

**Ask the agent:** to run `/grill-me` and interrogate the goal: who is this for,
what counts as "protected", what happens on a domain with no records at all, what
this deliberately does not do (no port scanning, no storing of domains anyone has
looked up, no scanning of anything other than the one domain typed in).

**Done looks like:** the agent produces the eight-line brief (`Actor`,
`Observation`, `Outcome`, `Mechanism`, `Examples`, `Non-goals`, `Permissions`,
`Done when`) and it matches what you actually want - correct it out loud if not.

**If it drags:** answer briefly and move on rather than debating every question -
the brief can be corrected later, and a fast, roughly-right answer teaches the
pattern better than a stalled interview.

## Stage 3: the agent writes the plan

It does not start typing code yet either - it writes the plan first, so you can
object before it builds the wrong thing.

**Ask the agent:** to turn the brief into a short, concrete plan: one page, one
domain field, two independent results (email authentication, security headers),
built in that order, with `README.md` updated to describe the real application
once it exists.

**Done looks like:** a short, readable plan exists (in the chat or a file) that
maps directly to the goal from Stage 1, and you have said "yes, build that"
before any source file changes.

**If it drags:** accept a plan stated out loud instead of written to a file, and
move on - the point is that a plan existed and was agreed to, not its format.

## Stage 4: build the DNS checks (SPF, DMARC, DKIM)

Build the part that needs no server at all - a browser can ask the internet's
phone book directly.

**Ask the agent:** to build the domain form and query DNS straight from the
browser using DNS-over-HTTPS (DoH) - a way of asking a DNS question over a normal
HTTPS request instead of the raw DNS protocol, which is why a browser can do it
without any backend. Cloudflare's DoH JSON endpoint
(`https://cloudflare-dns.com/dns-query`, with an `accept: application/dns-json`
header) deliberately allows requests from any website's JavaScript - its response
carries `Access-Control-Allow-Origin: *`. Concretely:

- **SPF** - a TXT record on the domain itself, starting with `v=spf1`.
- **DMARC** - a TXT record on `_dmarc.<domain>`, starting with `v=DMARC1`.
- **DKIM** - a TXT record on `<selector>._domainkey.<domain>`. There is no fixed
  selector; a real check can only try a short list of common ones (for example
  `google`, `default`, `selector1`) and report "not detected", never "fail", when
  none of them match - a wrong selector proves nothing about whether DKIM exists.

**Done looks like:** typing a real domain shows a genuine pass or fail for SPF and
DMARC, and an honest "not detected" (not a false "fail") for DKIM.

**If it drags:** have the agent get ONE query working end to end first - SPF on a
single hardcoded domain, printed raw to the page - before generalizing to a form
and all three records.

## Stage 5: run it, hit a real error, fix it together

Now try to break it - not on purpose, just by using it the way a real person
would. Try a domain with no DMARC record, a typo, an empty field, a domain that
does not exist at all.

**Ask the agent:** nothing scripted - read whatever error actually appears (in
the page, or the browser console) and have it explain the error before fixing it.
If nothing breaks on the first few tries, that is a finding too: say so, and try
a stranger input until something does.

**Then pin the fix with a test - and watch the agent configure itself.** Ask the
agent to write a component test that types the exact input that just broke the
app and asserts the fixed behaviour. The template deliberately ships no DOM test
environment - the unit harness runs plain Node - so the agent has to notice the
missing piece and add it itself: install the packages (jsdom and a component
testing library), wire the test environment into the config, and prove it by
running the new test red-green. The point to notice: **the setup is not missing
by accident, it is a task - an agent can extend its own harness, and you just
watched it happen.**

**Done looks like:** a real failure occurred, the agent correctly named its cause
before touching code, the fix is verified by re-running the same input that broke
it - not just by re-reading the code - and that input now lives in a component
test the agent could only run after configuring the DOM environment on its own.

**If it drags:** if no error surfaces within a couple of minutes, feed it a
domain known to have no DNS records at all, or a malformed one - that reliably
finds the gap between "the happy path works" and "the code handles reality". If
time is short, the self-configuration beat can shrink to the install-and-config
step with the test left for later - the lesson is the agent extending its own
harness, not the test itself.

## Stage 6: add the security-headers check - and hit a wall

Check headers the same way you just checked DNS - or try to.

**Ask the agent:** first, to fetch a real site's response headers directly from
the browser, the same way it fetched DNS - and hit the wall: a browser's `fetch`
to another website is not allowed to read most of that response's headers unless
the target site explicitly opts in, because reading a stranger's headers is
exactly the kind of cross-site snooping the browser's security model exists to
stop. Have the agent explain, in its own words, why this is a browser security
rule and not a bug in the code just written - **this is the point of the whole
lab.**

Then: ask it to build the smallest thing that solves it - one small serverless
function (in an `api/` folder, deployed on Vercel) that fetches the target site
from a server, where no browser cross-origin rule applies, and hands back just
the headers that matter as plain JSON. The page then calls this function instead
of calling the target site directly.

**Done looks like:** you can state, unprompted, why DNS worked from the browser
and headers did not. The network tab shows the page calling your own `/api/...`
endpoint, and that endpoint returning real header results for a real site.

**If it drags:** get the function working from the command line first (call it
directly, read the raw JSON back) before wiring the page to it - that separates
"does the function work" from "does the page call it correctly".

## Stage 7: review before deploy - a second agent attacks the change

The change is committed on a branch. Nothing ships until an agent that did not
write it says SHIP.

**Ask the agent:** nothing - this stage belongs to a SECOND agent. Open a fresh
agent session, point it at the branch, and run the reviewer
(`.claude/agents/reviewer.md` - read-only tools, no editing). It reads
`git diff main...HEAD`, then every changed file in full, and runs `npm run verify`
itself - believing its own run, not the builder's report. It returns SHIP or
NO-SHIP, findings worst first, each carrying the concrete sequence that triggers
it.

**Done looks like:** an agent that did not write the change has said SHIP, on its
own run of the checks. NO-SHIP findings go back to the first agent to fix; the
reviewer reads the result again. Only then do you deploy.

**If it drags:** if the reviewer answers SHIP immediately, read its "what I
tried" list - a review that names its attack paths teaches more than a bare
pass. If time is short, fix only the findings that carry an executable sequence
and keep the rest as notes.

## Stage 8: connect the pipeline - the agent does its own ops

Vercel knows the account (Stage 0), but it has never heard of this project.
Wiring the two together is work - and it is work an agent can do, like any
other task: it reads the tool's documentation, runs the commands, and shows
the output as proof. The same move sets up any command-line tool or MCP
server you meet later.

**Ask the agent:** to connect the project to Vercel from the terminal:
`npx vercel login` (confirms the Stage 0 account in a browser window), then
`npx vercel link` (ties this folder to a Vercel project, creating one - the
setup questions' defaults are fine), then `npx vercel git connect` (takes the
repository address from the local git config and connects it to the linked
project, so every push builds from now on).

**Done looks like:** `vercel link` has confirmed the project by name, and the
project is visible in the Vercel dashboard.

**If it drags:** the login handshake happens in a browser window - if the
agent stalls waiting for it, finish the sign-in yourself and hand back only
the `link` step. The commands are Vercel's own CLI reference: vercel.com/docs/cli
(login, link, git).

## Stage 9: deploy to Vercel

So far this exists on one laptop. Put it somewhere anyone can open.

**Ask the agent:** to deploy the project to Vercel and confirm the deployed site
works end to end - both checks, called from the live URL, not from localhost.

**Done looks like:** a public URL where typing a domain returns real results for
both checks, verified by actually opening that URL - on a phone is best - not by
trusting a "deployed successfully" message.

**If it drags or login blocks you:** the login and the link are Stage 8 jobs -
if they were skipped, run Stage 8 now and re-run only the deploy; nothing else
in the lab depends on them.

## Stage 10: secure it

You just built a tool that judges other sites' security headers. What does it say
about your own?

**Ask the agent:** to run the app's own header check against its own deployed
URL, add whichever headers are missing, and then explain - in words, not
necessarily in code, if time is short - what stops a stranger from using the
public `/api/...` endpoint as a free way to probe arbitrary domains at volume,
and what a minimal rate limit on that endpoint would look like.

**Done looks like:** the app's own deployed headers pass its own check, and you
can explain the rate-limiting gap even if the code for it was not written today.

**If it drags:** do the self-check and the header fixes live, and leave rate
limiting as a spoken explanation and a follow-up task rather than code - a clear
explanation of an unfixed gap is worth more than a rushed fix nobody understood.
