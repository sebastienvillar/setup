# Implementation plans

When creating implementation plans (including in plan mode), always add an "Intent" section at the top that captures goal and motivation. Capture what the user requested and the intent arrived at through brainstorming. Focus on *why*, not just *what*.

---

# Plan saving

Save the plan to the [figma/svillar](https://github.com/figma/svillar) GitHub repository when explicitly requested, or once the plan is finalized and prior to execution. Once the plan is saved, print the github link to the file

Name the file using this format: `yyyy-mm-dd-<description>`

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

- PR descriptions should only describe the intent of the changes, not summarize code changes or include code pointers. Reviewers can see the changed files themselves.
- PR title naming:
  - Single PR: `<short-description>`
  - Stacked PRs: `<project-name> [partX] <short-description>`. When creating a new part, update the titles of previous PRs in the stack to ensure they all have the correct part numbers.
