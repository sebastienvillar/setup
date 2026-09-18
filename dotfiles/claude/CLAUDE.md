# Implementation plans

When creating implementation plans (including in plan mode), always add an "Intent" section at the top that captures goal and motivation. Capture what the user requested and the intent arrived at through brainstorming. Focus on *why*, not just *what*.

---

# Plan execution

During implementation:
- Implement the entire plan in one pull request.
- After implementation, run the relevant verification tools for the code that was changed (e.g. tests, `tsc`, `eslint`, and other applicable tools for those changes)
After implementing the entire plan in one
- Once done, create a pull request

---

# Coding preferences

- When coding in typescript, export the main function/component as default.
- Add a concise comment above every function and block of code you create that is not trivial that describes what it does. It should allow quickly reading files and functions without needing to read the actual code specifics. Do not describe where the function is used from. This breaks encapsulation and these comments become stale as the code evolves.

---

# Git workflows

- Use aviator CLI (av) to create stacked branches/pull requests.
- Branch naming:
  - Single branch: `seb/<linear-id>-<short-description>` // i.e. `seb/FIG-123-add-button-provision-sandbox`, `seb/add-button-provision-sandbox`
  - Stacked branches: `seb/<project-name>-<linear-id-partX>-<short-description>`  // i.e. `seb/provisioning-FIG-123-part1-add-button-provision-sandbox`, `seb/provisioning-part1-add-button-provision-sandbox`

Where <linear-id> is the id of the linear ticket that was referenced in the conversation. Do not try to find a ticket id on your own. If no ticket was referenced in the conversation, do not add one

---

# Pull requests

- PR descriptions should follow this format:
```
_Written with AI_

# Goal
<Describe the product goal of the feature if there's one or goal of the change>

# Description
<Describe the high level changes - it should explain what concepts/systems/boundaries needed to changed/be added and how it changed the overall system. If appropriate, describe a before and after. Be concise>
```

- PR title naming:
  - Single PR: `<[linear-id]><short-description>` // i.e. `[FIG-123] Add button to provision sandbox`, `Add button to provision sandbox`
  - Stacked PRs: `<project-name> [<linear-id> - Part X] <short-description>`. When creating a new part, update the titles of previous PRs in the stack to ensure they all have the correct part numbers. // i.e. `Provisioning [FIG-123 - Part 1] Add button to provision sandbox`, `Provisioning [Part 1] Add button to provision sandbox`

Where <linear-id> is the id of the linear ticket that was referenced in the conversation. Do not try to find a ticket id on your own. If no ticket was referenced in the conversation, do not add one

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