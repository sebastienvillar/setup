# setup

Personal bootstrap repo for setting up a new Mac laptop or a Linux devbox/sandbox. Installs Homebrew packages, dotfiles, scripts, and editor configs.

## Entry points

- `install.sh` — top-level installer. Runs all steps by default; flags select individual steps (`--brew`, `--dotfiles`, `--scripts`, `--configs`). `--devbox` switches to the Linux devbox variant. `--yes`/`-y` skips prompts; `--no-backup` skips backups.
- `restore.sh` — restores dotfiles and editor configs from the most recent backup.

## Layout

- `scripts/` — installer logic. Each top-level step has its own script:
  - `brew.sh` / `brew-devbox.sh` — Homebrew packages (laptop vs devbox); both run `paste.sh`.
  - `paste.sh` — runs `figma/paste` setup, then copies its MCP entry into `~/.pi/agent/mcp.json`, which paste setup does not configure.
  - `dotfiles.sh` — installs `~/.zshrc`, `~/.tmux.conf`, Codex config and agents into `~/.codex/`, Codex skills into `~/.agents/skills/`, Codex prompts into `~/.codex/prompts/`, and Pi prompts, extensions, rules, `AGENTS.md`, and `tui.json` into `~/.pi/agent/` (then `npm ci` plus `dotfiles/pi/patches/` for extension packages).
  - `configs.sh` — installs Cursor and VS Code `settings.json` and `keybindings.json` (paths differ on macOS vs Linux).
  - `scripts.sh` — copies helper scripts into `~/.local/bin/` (currently `terminal-title`).
  - `lib.sh` — shared helpers: `copy`, `backup`, `safe_remove`, `restore_from_backup`, `init_backup`.
  - `terminal-title.sh` — the helper script itself, not part of installer logic.
- `dotfiles/` — source files copied into `$HOME`. `codex/` holds Codex configuration (`config.toml` and `config-devbox.toml`), `AGENTS.md`, agents, skills, and prompts.
- `configs/` — editor settings for `cursor/` and `vscode/`.

## Conventions

- Devbox variant: `--devbox` selects `brew-devbox.sh` and `config-devbox.toml` (Codex in bypass-permissions mode).
- Backups: every file overwrite is backed up to `~/.dotfiles-backup/<timestamp>/` or `~/.configs-backup/<timestamp>/` unless `--no-backup` is passed. `restore.sh` reads from the latest timestamped directory.
- Local overrides: `.zshrc.local` is gitignored and not tracked.
- Interactive by default: `copy` in `lib.sh` prompts before overwriting an existing non-symlink file. `--yes`/`-y` makes the run non-interactive.

## When editing

- New dotfile → add a `copy` call in `scripts/dotfiles.sh` (and a matching `safe_remove` in `uninstall`).
- New Codex prompt → add it to `dotfiles/codex/prompts/`; `scripts/dotfiles.sh` installs it into `~/.codex/prompts/`.
- New Pi prompt (a `/name` command in Pi) → add it to `dotfiles/pi/prompts/`; `scripts/dotfiles.sh` installs it into `~/.pi/agent/prompts/`.
- New Pi extension → add a directory with `index.ts` to `dotfiles/pi/extensions/`; Pi auto-discovers it in `~/.pi/agent/extensions/`. Add npm imports to `dotfiles/pi/package.json` and rerun `npm install --package-lock-only` there. Do not add `@earendil-works/*` or `typebox`; Pi supplies them.
- New Pi rule → add it to `dotfiles/pi/rules/` and list it in `dotfiles/pi/AGENTS.md`.
- Rule shared by Pi, Claude, and Codex → add it to `dotfiles/shared/`. `scripts/dotfiles.sh` installs it for Pi (`rules/`), Claude (`~/.claude/`), and Codex (appended to `~/.codex/AGENTS.md`). List it in `dotfiles/pi/AGENTS.md` and add an `@~/.claude/<rule>.md` import to `dotfiles/claude/CLAUDE.md`.
- New editor → mirror the cursor/vscode pattern in `scripts/configs.sh`.
- New helper script for `~/.local/bin` → add to `scripts/scripts.sh`.
- Devbox-specific behavior → branch on `$DEVBOX` and add a `*-devbox` source file.
