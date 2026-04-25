---
name: commit
description: Format commit messages with lowercase titles and detailed problem/solution paragraphs. Use this when users ask to commit code changes with proper structured messages.
---

When the user asks you to commit code changes, follow these steps:

1. Run `npm run check` scoped to the staged files to verify Biome formatting and linting passes. Get the list of staged files with `git diff --name-only --cached`. If the check fails, report the errors to the user and do not commit.
2. Escalate permissions and then run `git add` and `git commit` in the same command, using this exact format:

## Format structure

```
lowercase title summarizing the change

problem paragraph explaining what was broken/wrong/suboptimal. this should be detailed and comprehensive, explaining the root cause, symptoms, and why it needed to be fixed. use flowing prose, not bullet points. can be multiple sentences, as long as needed to fully explain the context.

solution paragraph explaining what was done to fix it, what specific code/files were changed, what the new behavior is, and why this solves the problem. include implementation details. use flowing prose, not bullet points. can be multiple sentences, as long as needed to fully document the changes.
```

## Rules

- Title: all lowercase, concise summary
- Title must not contain any issue id, user story id, ticket id, or similar reference
- No section headers like "problem:" or "solution:" or "changes:"
- No bullet points anywhere
- No "next steps" section
- Problem and solution are just two paragraphs of flowing text
- Solution paragraph includes both what changed AND the implementation details (files, parameters, logic)
- Be as detailed as necessary in both paragraphs
- Maintain professional technical writing style
- Do NOT include "generated with" or "co-authored by claude" spam into the commit message

## Example

```
implement restorative masonry: balanced 50/50 noise bias

the 80% fake wall bias trained a "demolition crew" model that learned to delete walls but not restore them. the training was asymmetric: 80% of noise blocks were fake walls (teaching deletion) and only 20% were fake holes (barely teaching restoration). this caused maps to dissolve into static over time as the model aggressively removed structure without learning to fill holes.

changed the noise bias from 80/20 to 50/50 by updating is_wall_low probability from 0.8 to 0.5 in train_rssm.py. now 50% of noise blocks are fake walls (teaching deletion) and 50% are fake holes (teaching restoration). this forces the model to learn contextual reasoning instead of a "delete everything" heuristic and matches the inference distribution where errors are bidirectional.
```
