# Pi extensions

Copied from [jfmyers9/agent](https://github.com/jfmyers9/agent/tree/cc822d2bc59085b3ca91bdfb5a51f14ed68f848f/harnesses/pi/extensions) at `cc822d2`, without tests. `../rules/`, `../tui.json`, and `../patches/` come from the same commit.

Pi auto-discovers each `*/index.ts` in `~/.pi/agent/extensions/`:

- `runtime-support/`: loads `@luan.sh/pi-libtui` and `/xsettings`, and frames codemode rows
- `collapse-transcript/`: folds finished tool and thinking activity into expandable rows
- `auto-compact-resume/`: keeps the real error when auto-compaction fails
- `pretty/`: nicer rendering for built-in tool output
- `ask/`: `ask_user` dialog tool
- `async-questions/`: `request_user_input_async` and `/questions`
- `session-timers/`: `session_timer` tool and `/timers`
- `convergence-loop/`: `/loop` and `/goal`
- `tui/`: footer and editor chrome, `/cost`, `/usage-bars` (reads `~/.pi/agent/tui.json`), the `took 12s` / `received 1 min ago` line under each finished turn, and `/costs` (`Cmd+O` via Ghostty's `alt+o` mapping) for cost per session today and over the past 7 days

Local additions, not from jfmyers9/agent:

- `collapse-tools/`: collapsed tool calls show one line with the tool and its command; click a row or press `Ctrl+O` to show the full rendering

`shared/`, `routing/`, and `subagents/` hold only the modules these extensions import. They have no `index.ts`, so Pi does not load them as extensions.

`../package.json` lists the `@luan.sh/*` packages they import. Pi supplies `@earendil-works/*` and `typebox`, so `../.npmrc` turns off peer installs. `scripts/dotfiles.sh pi` runs `npm ci` in `~/.pi/agent` and then applies `../patches/`.
