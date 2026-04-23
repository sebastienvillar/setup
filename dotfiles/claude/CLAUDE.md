# Implementation plans

When creating implementation plans (including in plan mode), always add an "Intent" section at the top that captures goal and motivation. Capture what the user requested and the intent arrived at through brainstorming. Focus on *why*, not just *what*.

---

# Plan review

After creating or significantly revising an implementation plan:
1. Automatically call `/review-plan` with the full plan text.
2. Incorporate the review feedback by updating the plan — fix critical issues and apply recommendations.
3. Present the updated plan to the user.

---

# Plan execution

After implementing each step of a plan:
1. Run the relevant verification tools for the code that was changed (e.g. tests, `tsc`, `eslint`, and other applicable tools for those changes).
2. Fix any issues before moving on.
3. Commit and create a stacked PR using `av` (one stacked PR per step).

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

- PR descriptions should only describe the intent of the changes, not summarize code changes or include code pointers. Reviewers can see the changed files themselves.
- PR title naming:
  - Single PR: `<short-description>`
  - Stacked PRs: `<project-name> [partX] <short-description>`. When creating a new part, update the titles of previous PRs in the stack to ensure they all have the correct part numbers.
