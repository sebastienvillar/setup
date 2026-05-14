---
name: address-pr-feedback
description: Check the current branch's GitHub PR for review feedback and address it systematically. Use when the user asks to address PR comments, respond to reviewers, or process PR review feedback.
---

You are addressing review feedback on the current branch's GitHub pull request.

## Steps

### 1. Fetch PR review comments

Get the PR number for the current branch:

```bash
gh pr view --json number,url -q '.number'
```

Then fetch all pending review comments:

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate
```

Also fetch top-level PR review bodies:

```bash
gh pr view --json reviews -q '.reviews[] | select(.state != "APPROVED") | {author: .author.login, state: .state, body: .body}'
```

Filter to unresolved comments only. Group comments by file and thread.

### 2. Triage comments

For each comment thread, classify it:

- **Actionable** — requests a code change, fix, or improvement
- **Question** — asks for clarification (answer it in the reply)
- **Nit/optional** — minor style suggestions (fix them anyway, they're fast)
- **Praise/acknowledgment** — no action needed, skip

Print a summary table of all comments with their classification before starting work.

### 3. Address actionable comments using subagents

For each actionable comment (or small group of related comments on the same file), spawn a Codex subagent (when subagent delegation is available) to:

- Read the relevant file(s)
- Understand the reviewer's request
- Make the requested change
- Keep changes minimal and focused on what was asked

Launch independent fixes in parallel where possible. For comments that depend on each other, handle them sequentially.

### 4. Stage and commit

After all subagents complete, review the combined changes:

```bash
git diff
```

Stage and commit as a single commit with a message like:

```
address pr feedback
```

### 5. Respond to each comment thread

For each comment you addressed, reply on GitHub with a short summary (1-2 sentences) of what you changed. Every reply MUST end with the trailer `\n\n_Commented by Codex_` on its own line. Use:

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments/{comment_id}/replies -f body="<reply>

_Commented by Codex_"
```

For top-level review comments, reply on the review itself (same trailer).

If the change was straightforward and clearly addresses the feedback, resolve the thread:

```bash
gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "<thread_node_id>"}) { thread { isResolved } } }'
```

Do NOT resolve threads where:

- The reviewer asked a question and you're unsure of the answer
- The change was subjective and the reviewer may want to verify
- You couldn't fully address the feedback

### 6. Push

Push the changes:

```bash
git push
```

Print a summary of what was addressed, what was replied to, and what (if anything) was left unresolved.

## Important

- Do NOT amend previous commits — always create new ones.
- Do NOT force push.
- Do NOT resolve threads you're unsure about — let the reviewer verify.
- Keep replies concise — reviewers don't want essays.
- Always end every reply with `_Commented by Codex_` on its own line so reviewers can tell the response came from an agent.
- If a comment requires a large or risky change, flag it to the user instead of attempting it.
