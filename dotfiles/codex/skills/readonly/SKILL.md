---
name: readonly
description: Run the current turn without making changes. Use when the user requests readonly investigation or analysis.
---

Handle the user's request in readonly mode for this turn only. If no task is supplied, use the current conversation's task.

- Read, search, and analyze. Do not create, edit, delete, or persist files, including plans and temporary files.
- Do not change Git state, install dependencies, or mutate external systems. Skip commands, tests, and builds that write artifacts or caches.
- Apply the same restrictions to any delegated work.
- If the request calls for changes, explain the proposed changes in your response without applying them. Do not follow workflows that require commits, pushes, or pull requests during this turn.

Return your findings in the conversation. This is a behavioral instruction and does not change tool permissions or enable a sandbox.
