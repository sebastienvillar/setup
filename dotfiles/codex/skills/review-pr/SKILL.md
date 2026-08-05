---
name: review-pr
description: Carefully review a GitHub PR for merge-readiness — correctness, clean code, idiomatic design, and unnecessary complexity — and report findings in the conversation. Use when the user asks to review a PR, check if a PR is ready to merge, or critique a PR's changes.
---

Carefully review this PR to ensure it's ready to merge. Focus not only on correctness, but also on clean code, idiomatic design, no unnecessary complexity, and not over-engineering. Differentiate between merge-blocking issues and follow-ups.

**Report your findings in the conversation. DO NOT comment on the PR.**

The target PR is whatever the user specified in the current prompt (a PR number, URL, or branch). If the prompt does not name one, default to the current branch's PR.

## 1. Resolve the PR

If the user named a PR, use it (`gh pr view <arg>`). Otherwise default to the current branch's PR:

```bash
gh pr view --json number,title,url,headRefName,baseRefName,body
```

If no PR exists for the current branch, stop and tell the user.

## 2. Gather context

Read the full diff and the PR intent:

```bash
gh pr diff <number>
```

- Read the PR title and body to understand the intended change.
- Open the changed files at `HEAD` (not just the diff hunks) so you review the code in its real surroundings, not in isolation.
- Grep/read the surrounding code to learn the existing conventions the change should match.

## 3. Review

Evaluate the change across these dimensions. For anything non-trivial, verify claims against the actual code rather than trusting the diff or the description.

- **Correctness** — Does it do what it intends? Edge cases, error handling, off-by-one, null/undefined, concurrency, resource leaks. Does it break existing behavior or callers?
- **Clean code** — Naming, readability, dead code, duplication, misplaced responsibilities. Would a new reader understand it?
- **Idiomatic design** — Does it follow the patterns and abstractions already used in this codebase, or invent inconsistent ones?
- **Unnecessary complexity / over-engineering** — Speculative generality, premature abstraction, indirection that isn't earned, config/flags nothing uses yet. Could this be simpler and still meet the requirement?
- **Tests** — Are the changes covered? Do the tests actually assert behavior rather than tautologies?

For a large or wide-ranging diff, spawn Codex subagents in parallel (when subagent delegation is available) split by dimension or by file group, each returning concrete findings, then consolidate. For a small diff, review directly.

## 4. Report

Report in the conversation using this format. Order findings by severity within each section, and reference `file:line` so the user can jump to each one.

```
# PR Review — <title> (#<number>)

## Merge-blocking
- <issues that must be fixed before merge: correctness bugs, broken behavior, missing critical tests>

## Follow-ups
- <non-blocking improvements: cleanups, simplifications, nits, optional refactors that can land later>

## Looks good
- <aspects that held up well under scrutiny>

## Verdict
<Ready to merge / Not ready — one line on what, if anything, blocks it>
```

Omit any section with no entries. Be direct and specific — no process narration.

## Important

- DO NOT post comments, reviews, or replies on the PR. All output goes to the conversation only.
- Do not push, edit, or fix the code — this skill reviews, it does not change anything.
- Be honest about severity: don't inflate nits into blockers, and don't wave through real correctness risks as follow-ups.
