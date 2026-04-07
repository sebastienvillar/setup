#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_SCRIPTS_DIR="$SCRIPT_DIR/../scripts"

install() {
  echo "Installing scripts..."
  mkdir -p "$HOME/.local/bin"
  cp "$REPO_SCRIPTS_DIR/terminal-title.sh" "$HOME/.local/bin/terminal-title"
}

uninstall() {
  echo "Removing scripts..."
  local target="$HOME/.local/bin/terminal-title"
  if [[ -e "$target" ]]; then
    rm -f "$target"
  fi
}

cmd="${1:-install}"
case "$cmd" in
  install)   install ;;
  uninstall) uninstall ;;
  *)         echo "Unknown command: $cmd"; exit 1 ;;
esac
