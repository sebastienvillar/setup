---
name: format-plan
description: Format and present a final implementation plan. Use when the user asks to create, write, or finalize an implementation plan for a feature, refactor, or project.
argument-hint: [description of what to plan]
---

Create a final implementation plan for: $ARGUMENTS

## Plan format

Use the following markdown format for the plan:

```
# Implementation Plan

## Intent

<Describe the goal and motivation behind this work. This should capture what the user requested and the intent arrived at through brainstorming together. Focus on *why* this work is being done, not just *what*.>

---

## Design

<Describe how each piece of the system works together. This is the overall architecture and design — how components interact, data flows, and key abstractions. Keep it high-level enough to convey the shape of the solution without getting into step-by-step implementation.>

---

## Sequencing

<Brief summary of the implementation sequence. Each step should be independently shippable as its own PR.>

1. **<Step title>** — <one-line summary of what this step does and how it contributes to the intent>
2. **<Step title>** — <one-line summary>
3. ...

---

## Steps

### 1. <Step title>

#### Testing

<Describe how this step will be tested. Include a combination of:>
- **Unit tests:** <what units/functions are tested in isolation>
- **Integration tests:** <how components interact, what interactions are verified>
- **E2E tests:** <end-to-end scenarios, if applicable for this step>

<Omit a test category only if it genuinely does not apply to this step.>

#### Implementation

<Implementation details for this step. What changes are made, where, and any key decisions or constraints.>

### 2. <Step title>

#### Testing

...

#### Implementation

...

<...repeat for each step...>
```

## Guidelines

- The **Intent** section must reflect the user's request and the shared understanding from brainstorming — not just a restatement of the task.
- The **Design** section should give a reader enough context to understand *how* the solution fits together before diving into steps.
- The **Sequencing** section is a quick overview — each entry is one line. Detailed breakdowns go in the Steps section.
- Each step must be independently shippable as its own PR. Order steps so that each builds on the previous ones.
- Every step must have both a **Testing** and **Implementation** subsection.
- Testing should describe a concrete combination of unit, integration, and E2E tests. Omit a category only when it genuinely does not apply.
- Keep descriptions concise — no code snippets unless essential for clarity.
