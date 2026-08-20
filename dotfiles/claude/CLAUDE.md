# Implementation plans

When creating implementation plans (including in plan mode), always add an "Intent" section at the top that captures goal and motivation. Capture what the user requested and the intent arrived at through brainstorming. Focus on *why*, not just *what*.

---

# Plan execution

During implementation:
- Implement the entire plan in one pull request.
- Comments must not break encapsulation (i.e. comment on a function definition should not expose how the function is implemented but only it's goal)
- After implementation, run the relevant verification tools for the code that was changed (e.g. tests, `tsc`, `eslint`, and other applicable tools for those changes)
After implementing the entire plan in one
- Once done, create a pull request

---

# Coding preferences

- When coding in typescript, export the main function/component as default.
- Do not add comments describing where a function/property is used from. This breaks encapsulation and these comments become stale as the code evolves.

---

# Git workflows

- Use aviator CLI (av) to create stacked branches/pull requests.
- Branch naming:
  - Single branch: `seb/<short-description>`
  - Stacked branches: `seb/<project-name>-<partX>-<short-description>`

---

# Pull requests

- PR descriptions should follow this format:
```
# Goal
<Describe the product goal of the feature if there's one or goal of the change>

# Description
<Describe the high level changes - it should explain what concepts/systems/boundaries needed to changed/be added and how it changed the overall system. If appropriate, describe a before and after>
```

- PR title naming:
  - Single PR: `<short-description>`
  - Stacked PRs: `<project-name> [partX] <short-description>`. When creating a new part, update the titles of previous PRs in the stack to ensure they all have the correct part numbers.

---

# Commits and push

Always bypass Figma’s expensive HK hooks while retaining other Git safeguards.

- For all commits, including `av commit` and `git commit`, prefix the command with `NO_FIGMA_COMMIT_HOOK=1`.
- For all pushes, prefix the command with `NO_FIGMA_PRE_PUSH_HOOK=1`.
- Do not set `HK_PROFILE=slow`.
- Do not use `--no-verify` unless explicitly requested.

Examples:

```sh
NO_FIGMA_COMMIT_HOOK=1 av commit -a -m "..."
NO_FIGMA_COMMIT_HOOK=1 git commit -m "..."
NO_FIGMA_PRE_PUSH_HOOK=1 git push