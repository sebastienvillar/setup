---
name: review-plan
description: Review an implementation plan from multiple critical perspectives using parallel subagents. Use when the user asks to review, critique, or validate an implementation plan.
argument-hint: [the full implementation plan text]
disable-model-invocation: true
---

You are reviewing the following implementation plan:

$ARGUMENTS

## Instructions

Spawn **six subagents in parallel** using the Agent tool. Each subagent receives the full plan text above as its prompt context. Each subagent has access to the codebase and can use Grep, Glob, and Read to verify claims in the plan.

Every subagent prompt MUST start with the following block exactly:

```
## Plan Under Review

<paste the full plan text here>

---
```

Followed by the specific review angle instructions below.

### Subagent 1 — Completeness

```
Review this plan for completeness.

- Does the plan fully achieve the stated intent?
- Are there missing steps, prerequisites, or edge cases not accounted for?
- Are there implicit assumptions that should be made explicit?
- Grep the codebase to verify that referenced files and modules exist.

Report only genuine gaps. Do not restate what the plan already covers. Keep your response under 300 words.
```

### Subagent 2 — Risk & Failure Modes

```
Review this plan for risks and failure modes.

- What could go wrong during execution of each step?
- Are there irreversible actions without a rollback path?
- Are there single points of failure?
- Which step carries the highest risk and why?

Report only concrete risks, not generic warnings. Keep your response under 300 words.
```

### Subagent 3 — Ordering & Dependencies

```
Review this plan for step ordering and dependencies.

- Are the steps in the correct execution sequence?
- Are there hidden dependencies between steps that aren't acknowledged?
- Could any steps be parallelized to reduce effort?
- Does any step need to happen earlier than its current position?

Report only actual ordering issues. Keep your response under 300 words.
```

### Subagent 4 — Simplification

```
Review this plan for unnecessary complexity.

- Can any steps be eliminated without affecting the outcome?
- Can any steps be combined?
- Is there a simpler path to achieve the stated intent?
- Does the plan introduce abstractions or indirection that aren't justified?

Be specific about what to cut or simplify. Keep your response under 300 words.
```

### Subagent 5 — Ambiguity & Gaps

```
Review this plan for ambiguity and underspecification.

- Are any steps vague enough that two engineers would implement them differently?
- Are the "what" and "where" fields specific enough to act on?
- Are there decisions deferred that should be made now?
- Would someone unfamiliar with the project be able to execute each step?

Report only genuinely ambiguous items. Keep your response under 300 words.
```

### Subagent 6 — Design & Architecture

```
Review this plan for alignment with the existing codebase.

- Grep and read the relevant parts of the codebase to understand current patterns.
- Does the plan follow existing conventions and architecture?
- Does it introduce inconsistencies with how similar things are already done?
- Are the files and modules referenced the right place for these changes?
- Does the plan conflict with or duplicate existing functionality?

Be specific — reference actual files and patterns you find. Keep your response under 300 words.
```

## Consolidation

After all six subagents complete, consolidate their findings into a single review using this format:

```
# Plan Review

## Critical Issues
- <issues that would cause the plan to fail or produce wrong results>

## Recommendations
- <concrete improvements, ordered by impact>

## Validated
- <aspects of the plan that held up well under scrutiny>
```

Omit any section that has no entries. Be direct — no preamble or summary of the process.
