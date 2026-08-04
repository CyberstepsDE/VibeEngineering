# Lab: Build "Domain Security Check" From Zero

## What this is

A run sheet for the instructor, not a handout for students. On day one, students
walked through a finished application. Today there is no application - just this
template, a projector, and an agent building something live, in front of the class,
from a plain-language goal.

**The goal, stated once, for the class:** a page where you type a domain name and
get back whether its email is protected against spoofing (SPF, DMARC, DKIM) and
whether its website sends the security headers browsers respect. Two checks, one
page, no accounts, no stored data.

Stage 0 plus the nine stages below are the shape of the session, not a script to
read aloud. Follow them in order; the words inside each "instructor says" line are
a starting point, not a transcript.

## Stage 0: before the session (one-time setup, not a build step)

Ready before anyone is watching: the starter cloned fresh on the demo machine,
`npm ci` already run so `node_modules/` is warm, and a Vercel account (the free
Hobby plan, created as the Day 1 evening task) connected to the GitHub account that
owns the repository. This is the pipeline the deploy stage rides on - set it up
cold, in front of a class, and login friction eats the lab.

## Stage 1: `/start`, and tell the agent the goal

**Instructor says:** "We cloned the training starter fresh. Watch what happens when
I type one thing." Open the template in the agent, then type `/start`.

**The agent is asked:** nothing yet, beyond running `/start` itself. Let it read
`AGENTS.md`, confirm `npm run verify` is green on a template with no application in
it yet, and report back what it found - out loud, so the class hears a tool describe
its own starting state instead of assuming one.

Once it reports, give it the goal in one sentence: a page that checks a domain's
email authentication and its website's security headers.

**Done looks like:** the agent has stated, in its own words, what this repository
currently is (a clean template, no app yet) and has repeated the goal back
correctly. It has not written any code.

**If generation is slow:** narrate what `/start` is doing while it runs -
`npm ci`, then `npm run verify` - so the pause is visibly productive, not dead air.
If `npm ci` is slow on classroom wifi, run it once before the session starts so
`node_modules/` is already warm.

## Stage 2: the agent interviews you (`/grill-me`)

**Instructor says:** "Before it writes a line of code, it's going to ask us
questions - answer as the person who wants this tool, not as a programmer."

**The agent is asked:** to run `/grill-me` and interrogate the goal: who is this
for, what counts as "protected", what happens on a domain with no records at all,
what this deliberately does not do (no port scanning, no storing of domains anyone
has looked up, no scanning of anything other than the one domain typed in).

**Done looks like:** the agent produces the eight-line brief (`Actor`, `Observation`,
`Outcome`, `Mechanism`, `Examples`, `Non-goals`, `Permissions`, `Done when`) and the
class agrees it matches what they actually want, correcting it out loud if not.

**If generation is slow:** answer briefly and move on rather than debating every
question at length - the brief can be corrected later, and a fast, roughly-right
answer teaches the pattern better than a stalled interview.

## Stage 3: the agent writes the plan

**Instructor says:** "It doesn't start typing code yet either - it writes down the
plan first, so we can object before it builds the wrong thing."

**The agent is asked:** to turn the brief into a short, concrete plan: one page,
one domain field, two independent results (email authentication, security headers),
built in that order, with `README.md` updated to describe the real application once
it exists.

**Done looks like:** a short, readable plan exists (in the chat or a file) that maps
directly to the goal from Stage 1, and the class has said "yes, build that" before
any source file changes.

**If generation is slow:** accept a plan stated out loud instead of written to a
file, and move on - the point is that a plan existed and was agreed to, not its
format.

## Stage 4: build the DNS checks (SPF, DMARC, DKIM)

**Instructor says:** "Let's build the part that doesn't need a server at all - a
browser can ask the internet's phone book directly."

**The agent is asked:** to build the domain form and query DNS straight from the
browser using DNS-over-HTTPS (DoH) - a way of asking a DNS question over a normal
HTTPS request instead of the raw DNS protocol, which is why a browser can do it
without any backend. Cloudflare's DoH JSON endpoint
(`https://cloudflare-dns.com/dns-query`, with an `accept: application/dns-json`
header) allows requests from any website's JavaScript - confirmed live before this
lab was written, its response carries `Access-Control-Allow-Origin: *`. Concretely:

- **SPF** - a TXT record on the domain itself, starting with `v=spf1`.
- **DMARC** - a TXT record on `_dmarc.<domain>`, starting with `v=DMARC1`.
- **DKIM** - a TXT record on `<selector>._domainkey.<domain>`. There is no fixed
  selector; a real check can only try a short list of common ones (for example
  `google`, `default`, `selector1`) and report "not detected", never "fail", when
  none of them match - a wrong selector proves nothing about whether DKIM exists.

**Done looks like:** typing a real domain shows a genuine pass or fail for SPF and
DMARC, and an honest "not detected" (not a false "fail") for DKIM.

**If generation is slow:** have the agent get ONE query working end to end first -
SPF on a single hardcoded domain, printed raw to the page - before generalizing to
a form and all three records.

## Stage 5: run it, hit a real error, fix it together

**Instructor says:** "Now we try to break it - not on purpose, just by using it
like a real person would." Try a domain with no DMARC record, a typo, an empty
field, a domain that does not exist at all.

**The agent is asked:** nothing scripted - read whatever error actually appears
(in the page, or the browser console) and explain it before fixing it. If nothing
breaks on the first few tries, that is a finding too: say so, and try a stranger
input until something does.

**Done looks like:** a real failure occurred, the agent correctly named its cause
before touching code, and the fix is verified by re-running the same input that
broke it - not just by re-reading the code.

**If generation is slow:** if no error surfaces within a couple of minutes, feed it
a domain known to have no DNS records at all, or a malformed one - that reliably
finds the gap between "the happy path works" and "the code handles reality".

## Stage 6: add the security-headers check - and hit a wall

**Instructor says:** "Let's check headers the same way we just checked DNS." Ask
the agent to fetch a real site's response headers directly from the browser, the
same way it fetched DNS.

**The agent is asked:** first, to try it and hit the wall: a browser's `fetch` to
another website is not allowed to read most of that response's headers unless the
target site explicitly opts in, because reading a stranger's headers is exactly the
kind of cross-site snooping the browser's security model exists to stop. Have the
agent explain, in its own words, why this is a browser security rule and not a bug
in the code just written - **this is the point of the whole lab.**

Then: ask it to build the smallest thing that solves it - one small serverless
function (in an `api/` folder, deployed on Vercel) that fetches the target site
from a server, where no browser cross-origin rule applies, and hands back just the
headers that matter as plain JSON. The page then calls this function instead of
calling the target site directly.

**Done looks like:** the class can state, unprompted, why DNS worked from the
browser and headers did not. The network tab shows the page calling our own
`/api/...` endpoint, and that endpoint returning real header results for a real
site.

**If generation is slow:** get the function working from the command line first
(call it directly, read the raw JSON back) before wiring the page to it - separates
"does the function work" from "does the page call it correctly".

## Stage 7: review before deploy - a second agent attacks the change

**Instructor says:** "The change is committed on a branch. Nothing ships until an
agent that did not write it says SHIP."

**The agent is asked:** nothing - this stage belongs to a SECOND agent. Open a
fresh agent session, point it at the branch, and run the reviewer
(`.claude/agents/reviewer.md` - read-only tools, no editing). It reads
`git diff main...HEAD`, then every changed file in full, and runs `npm run verify`
itself - believing its own run, not the builder's report. It returns SHIP or
NO-SHIP, findings worst first, each carrying the concrete sequence that triggers
it.

**Done looks like:** an agent that did not write the change has said SHIP, on its
own run of the checks. NO-SHIP findings go back to the first agent to fix; the
reviewer reads the result again. Only then do we deploy.

**If generation is slow:** if the reviewer answers SHIP immediately, read out its
"what I tried" list - a review that names its attack paths teaches more than a
bare pass. If time is short, fix only the findings that carry an executable
sequence and name the rest to the class as notes.

## Stage 8: deploy to Vercel

**Instructor says:** "Right now this only exists on one laptop. Let's put it
somewhere anyone can open."

**The agent is asked:** to deploy the project to Vercel and confirm the deployed
site works end to end - both checks, called from the live URL, not from localhost.

**Done looks like:** a public URL where typing a domain returns real results for
both checks, verified by actually opening that URL, not by trusting a "deployed
successfully" message.

**If generation is slow or account access is a blocker:** have one instructor
account pre-authenticated on the demo machine before class, so login friction never
eats lab time; students without their own Vercel account can still watch the same
deploy happen live.

## Stage 9: secure it

**Instructor says:** "We just built a tool that judges other sites' security
headers. What does it say about our own?"

**The agent is asked:** to run the app's own header check against its own deployed
URL, add whichever headers are missing, and then explain - in words, not
necessarily in code, if time is short - what stops a stranger from using the public
`/api/...` endpoint as a free way to probe arbitrary domains at volume, and what a
minimal rate limit on that endpoint would look like.

**Done looks like:** the app's own deployed headers pass its own check, and the
class can explain the rate-limiting gap even if the code for it was not written
today.

**If generation is slow:** do the self-check and the header fixes live, and leave
rate limiting as a spoken explanation and a follow-up task rather than code - a
clear explanation of an unfixed gap is worth more than a rushed fix nobody
understood.
