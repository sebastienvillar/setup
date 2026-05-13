# setup

Personal bootstrap repo for setting up a new Mac laptop or a Linux devbox/sandbox. Installs Homebrew packages, dotfiles, scripts, and editor configs.

## Entry points

- `install.sh` — top-level installer. Runs all steps by default; flags select individual steps (`--brew`, `--dotfiles`, `--scripts`, `--configs`). `--devbox` switches to the Linux devbox variant. `--yes`/`-y` skips prompts; `--no-backup` skips backups.
- `restore.sh` — restores dotfiles and editor configs from the most recent backup.

## Layout

- `scripts/` — installer logic. Each top-level step has its own script:
  - `brew.sh` / `brew-devbox.sh` — Homebrew packages (laptop vs devbox).
  - `dotfiles.sh` — installs `~/.zshrc`, `~/.gitconfig`, `~/.tmux.conf`, and `~/.claude/*` from `dotfiles/`.
  - `configs.sh` — installs Cursor and VS Code `settings.json` and `keybindings.json` (paths differ on macOS vs Linux).
  - `scripts.sh` — copies helper scripts into `~/.local/bin/` (currently `terminal-title`).
  - `lib.sh` — shared helpers: `copy`, `backup`, `safe_remove`, `restore_from_backup`, `init_backup`.
  - `terminal-title.sh` — the helper script itself, not part of installer logic.
- `dotfiles/` — source files copied into `$HOME`. `claude/` holds Claude Code settings (separate `settings.json` and `settings-devbox.json`) plus `CLAUDE.md` and `skills/`. `git/` has separate `gitconfig` and `gitconfig-devbox`.
- `configs/` — editor settings for `cursor/` and `vscode/`.

## Conventions

- Devbox variant: `--devbox` selects `brew-devbox.sh`, `gitconfig-devbox`, and `settings-devbox.json` (Claude in bypass-permissions mode).
- Backups: every file overwrite is backed up to `~/.dotfiles-backup/<timestamp>/` or `~/.configs-backup/<timestamp>/` unless `--no-backup` is passed. `restore.sh` reads from the latest timestamped directory.
- Local overrides: `~/.gitconfig.local` is created (empty `[user] email`) on first install and is not tracked. `.zshrc.local` is gitignored for the same purpose.
- Interactive by default: `copy` in `lib.sh` prompts before overwriting an existing non-symlink file. `--yes`/`-y` makes the run non-interactive.

## When editing

- New dotfile → add a `copy` call in `scripts/dotfiles.sh` (and a matching `safe_remove` in `uninstall`).
- New editor → mirror the cursor/vscode pattern in `scripts/configs.sh`.
- New helper script for `~/.local/bin` → add to `scripts/scripts.sh`.
- Devbox-specific behavior → branch on `$DEVBOX` and add a `*-devbox` source file.
