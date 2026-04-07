#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_SCRIPTS_DIR="$SCRIPT_DIR/../scripts"

install() {
  echo "Installing scripts..."
  mkdir -p "$HOME/.local/bin"
  ln -sf "$REPO_SCRIPTS_DIR/terminal-title.sh" "$HOME/.local/bin/terminal-title"
}

uninstall() {
  echo "Removing script symlinks..."
  local target="$HOME/.local/bin/terminal-title"
  if [[ -L "$target" ]]; then
    rm -f "$target"
  elif [[ -e "$target" ]]; then
    echo "Warning: $target is not a symlink, skipping"
  fi
}

cmd="${1:-install}"
case "$cmd" in
  install)   install ;;
  uninstall) uninstall ;;
  *)         echo "Unknown command: $cmd"; exit 1 ;;
esac
