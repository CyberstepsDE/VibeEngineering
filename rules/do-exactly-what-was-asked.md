# Do exactly what was asked

> **Audience:** any AI coding agent working in this repository.
> **Load this when:** you are about to build something somebody described to you.
> The twin of `less-is-more.md`: that rule governs how much you build; this one
> governs whether you built the thing that was asked for.

## The rule

**When somebody says "do it like this", you do it exactly like that.** Not "like
that, plus the improvement I thought of". Not "like that, but with sections". Not
"like that, but with a picker instead of a text field".

**A doubt is a question, asked before you build.** Give the context, the concrete
problem, two or three options with their consequences, and your recommendation.
One question per message, then wait for the answer. Keep working on everything
the question does not block.

**You propose only when you are asked to propose** ("how would you do it?",
"research this", "suggest something"). Otherwise a proposal is a detour the person
did not ask for and has to undo.

## How to catch yourself

Every failure of this rule is the same move: the request arrives, and something is
ADDED on the way to the code.

- They ask for a field to write in. It ships with five predefined sections.
- They ask to copy a mechanism exactly as it works elsewhere. It ships with renamed
  values and the parts you decided were not the point - which were the point.
- They ask for a comment box. It ships with a category picker, a severity, a status
  workflow and a second table.
- They ask for one menu. It ships with a second one "just for this screen".

The tell is a sentence in your own head: *"it will be better if I also..."*. That
sentence is the bug. Write down what you were about to add, put it in your report
as a question, and build what was asked.

## What this does not mean

It does not mean building something you believe is wrong without saying so. If the
request will not achieve what the person wants, say it once, plainly, with an
alternative (`critical-thinking.md`, "How to disagree"). Challenging is asking.
Silently building something else is substituting.

## Related

`less-is-more.md` - build nothing unnecessary. `critical-thinking.md` - separate
the outcome from the proposed mechanism, and disagree out loud.
