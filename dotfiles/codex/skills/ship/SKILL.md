---
name: ship
description: Commit all changes, run preflight checks on modified areas, push, update the GitHub PR, then monitor CI. Use when the user asks to ship, commit and push, or finalize a branch.
---

You are shipping the current branch: commit staged changes, run scoped preflight checks, push, update the PR, and monitor CI.

## Steps

### 1. Assess changes

Run `git status`, `git diff --stat`, `git diff --name-only`, and `git log --oneline -5` for context. Determine which areas have unstaged/staged modifications:

- **fullscreen** — any files under `fullscreen/`
- **web** — any files under `web/`
- **other bazel packages** — any other directories that contain a `BUILD` or `BUILD.bazel` file

### 2. Stage changes

Stage all changes EXCEPT build artifacts (`dist/`, `build/`, `node_modules/`, `*.pyc`, `__pycache__/`, `.next/`, `coverage/`). Use `git add` with specific file paths. If unsure whether something is a build artifact, check `.gitignore` — if it's gitignored, skip it. If there are no changes to stage, skip to step 5.

### 3. Commit

Draft a concise commit message:

- Summarize the nature of the changes (feature, fix, refactor, etc.)
- Follow the repo's existing commit message style from recent history
- Focus on "why" not "what"

### 4. Preflight checks — only for files in the commit you just created (or the latest commit if nothing was staged)

Use `git diff --name-only HEAD~1..HEAD` to get the exact list of files in the latest commit. Only check those files.

**If any `fullscreen/` files were in the commit:**

```bash
cd fullscreen && ./fs wasm
```

**If any `web/js/` `.ts`/`.tsx`/`.js`/`.jsx` files were in the commit — targeted eslint:**

Build the exact file list, keeping the `js/` prefix (paths are relative to `web/`, NOT `web/js/`):

```bash
MODIFIED_WEB_FILES=$(git diff --name-only HEAD~1..HEAD \
  | grep '^web/js/.*\.\(ts\|tsx\|js\|jsx\)$' \
  | sed 's|^web/||')
```

Then pass the exact file list:

```bash
bazel lint //web:eslint \
  --//bazel/config/eslint:paths="$MODIFIED_WEB_FILES" \
  --fix
```

Print the file list and the full command before running so the user can verify scope.

NEVER omit `--//bazel/config/eslint:paths` — without it, bazel lints ALL of `web/` which is extremely slow.

**If any `web/` files were in the commit — typecheck:**

Run locally so errors print to stderr (remote execution hides them):

```bash
bazel build //web:ts_typecheck --remote_executor="" --remote_cache=""
```

**If other bazel packages were modified:** For each modified package, query for targets and run them:

```bash
bazel query 'kind(".*eslint.*", //package/path/...)'
bazel query 'kind(".*typecheck.*", //package/path/...)'
```

**If none of the above areas were modified**, skip preflight entirely.

IMPORTANT: Bazel commands share a single server and CANNOT run in parallel — they'll just queue behind each other. Run them sequentially: eslint first, then typecheck.

### 5. Handle preflight results

**If eslint `--fix` modified files:** Stage and commit those changes as a separate fixup commit before continuing (e.g. "fix: auto-fix eslint import ordering").

**If all checks pass (or no checks were needed):**

- Push with `git push` (or `git push -u origin HEAD` if no upstream).
- Check if a PR exists using `gh pr view --json number,title,body 2>/dev/null`. If a PR exists:
  - Read ALL commits on the branch since diverging: `git log --oneline $(git merge-base HEAD master)..HEAD`
  - Generate an updated PR description with a `## Summary` section (1-3 bullet points) and a `## Test plan` section covering ALL branch commits
  - Update the PR body using `gh pr edit --body`
  - Show the PR URL
- If no PR exists, confirm the push succeeded and show the branch name.

**If preflight checks fail — attempt easy fixes first.** If the errors are simple and mechanical (unused imports, missing semicolons, minor type errors, auto-fixable lint issues), fix them directly, commit the fixes as a new commit, then re-run ONLY the failed checks. Repeat up to 2 times. If all checks pass after fixes, proceed to push.

**If preflight checks still fail after fix attempts:** Print a clear report listing:

- Each failing check and the specific errors
- What files/lines are affected
- Suggested actions the user should take to resolve each issue
- Do NOT push to GitHub. Stop here.

### 6. Monitor CI after push

After a successful push, monitor CI with a **1-hour timeout**. The timeout resets each time you push new fixes.

**Polling loop:** Every 1 minute, check CI status:

```bash
gh pr checks 2>/dev/null
```

Print a brief status update each poll showing which checks are still running, which have passed, and how long you've been waiting.

**If all CI checks pass:** Report success. Done.

**If any CI check fails (up to 5 fix attempts, timeout resets on each push):**

a. Identify the failed checks from `gh pr checks 2>/dev/null | grep -i fail`.
b. For Buildkite failures, use the `check-ci` or `fix-ci` skill if available, OR read the Buildkite logs via the MCP tools:
   - Extract the build number from the Buildkite URL (e.g. `https://buildkite.com/figma/figma/builds/12345#job-id`)
   - Use `mcp__buildkite__get_build` with `org_slug="figma"`, `pipeline_slug="figma"`, `build_number` to get failed jobs
   - Use `mcp__buildkite__tail_logs` on failed job IDs to see error output
c. If the errors are simple and mechanical (lint, type errors, import issues, minor test fixes), fix them locally, commit as a new commit, push, and **restart the 1-hour timeout**.
d. Resume polling every 3 minutes for the new CI run.
e. Repeat up to 5 total fix-and-push attempts.

**If CI still fails after 5 fix attempts (or errors are too complex to auto-fix):** Print a detailed report:

- Which CI checks failed and their Buildkite URLs
- The actual error output from the failed jobs
- What files/lines are affected
- Suggested actions the user should take
- Stop here — do NOT keep pushing.

**If the 1-hour timeout expires with CI still running:** Report which checks are still pending and stop waiting. Do NOT push any more changes.

## Important

- Always use `bazel` for linting and typechecking — never run eslint or tsc directly.
- ALWAYS pass the explicit file list to `--//bazel/config/eslint:paths`. Never run `bazel lint //web:eslint` without it.
- Paths in `--//bazel/config/eslint:paths` are relative to `web/` and keep the `js/` prefix (e.g. `js/figma_app/lib/foo.ts`).
- Scope lint checks to ONLY the files in the latest commit (`HEAD~1..HEAD`), NOT the full branch diff against master.
- Run typecheck with `--remote_executor="" --remote_cache=""` so TS errors are printed locally instead of hidden on the remote server.
- Run bazel commands sequentially, NOT in parallel (they share a server lock).
- Do NOT commit files that look like secrets (.env, credentials.json, etc.).
- Do NOT amend previous commits — always create new ones.
- Do NOT force push.
