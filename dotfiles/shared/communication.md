# Communication

Applies to chat replies and PR descriptions.

## Sentences

- One idea per sentence. Split a sentence when it has more than one clause.
- Aim for 20 words or fewer per sentence.
- Use plain words. Prefer "use" over "leverage" and "start" over "initialize".
- Name the thing. Write "the retry loop in `fetch.ts`", not "this mechanism".
- Use active voice. Write "The cache drops stale entries", not "Stale
  entries are dropped".
- Drop filler such as "It's worth noting that", "essentially", and "in order to".

## Explaining how something works

- Start with a short overview in 3 to 5 sentences. Cover what the parts are
  and how data or control moves between them.
- Stay at the level of components and steps. Skip function names, edge cases,
  and code unless I ask.
- Use a short numbered list when the flow has clear steps.
- Add a small diagram or table when it shows the flow or the parts more
  clearly than prose.
- When I ask for detail, go one level deeper on the part I asked about only.

Example:

> Requests go through three layers. The router picks a handler by URL. The
> handler checks permissions and calls the service. The service reads from
> the cache and falls back to the database.

## Explaining a PR

Use this format for PR descriptions and for chat summaries of a PR.

```
# Goal
<One or two sentences: the product goal, or why the change is needed.>

# Changes
- <One bullet per feature or behavior change.>

# Review guide
- <Where to start reading, and why.>
- <The risky parts, and what could break.>

# Testing
- Approach: <red/green, or not red/green and why>
- Added: <new tests that validate the change, each with the behavior it checks>
- Existing: <existing tests that validate the change, each with the behavior it checks>
- Manual: <only if needed: manual checks the tests do not cover, each with what you saw>
```

- **Changes**: describe what changes for the user or caller, not which files
  changed. Group related edits into one bullet. Put refactors and cleanup in
  a last, separate bullet.
- **Examples**: add a before/after, a sample command, or a sample output under
  a Changes bullet when it makes the change clearer. Skip it for trivial changes.
- **Review guide**: point to the file or function with the core logic. Name
  real risks only. Skip this section for small PRs.
- **Testing**: show how you know the PR does what Goal says.
  - Approach: say whether you worked red/green. Red/green means you wrote a
    failing test first, saw it fail, then wrote the code and saw it pass. If
    not, say so and give the reason.
  - Added: name each new test that validates the change, and the behavior
    it checks.
  - Existing: name each existing test that validates the change, and the
    behavior it checks. Skip this line if there are none.
  - Manual: add this line only when a manual check validates something the
    tests do not, such as UI. Say what you did and what you saw.
  - List only tests that validate this PR's changes. Do not list unrelated
    tests or suites you also ran.
- Leave out implementation detail unless a reviewer needs it to review safely.

Example:

```
# Goal
Let users preview install changes without touching $HOME.

# Changes
- `--dry-run` prints each file it would copy and skips the copy:
      $ ./install.sh --dotfiles --dry-run
      would copy dotfiles/zshrc -> ~/.zshrc
- Backups are skipped in dry-run mode.

# Review guide
- Start with `copy` in `scripts/lib.sh`. It holds the new logic.
- Risky part: `restore.sh` must not treat a dry run as a backup.

# Testing
- Approach: red/green. `test_dry_run_skips_copy` failed before the change
  and passes after.
- Added: `test_dry_run_skips_copy` checks that no files change in $HOME.
- Existing: `test_restore` checks that restore ignores dry runs.
```
