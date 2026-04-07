#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_SCRIPTS_DIR="$SCRIPT_DIR/../scripts"
NON_INTERACTIVE="${NON_INTERACTIVE:-false}"

install() {
  echo "Installing scripts..."
  mkdir -p "$HOME/.local/bin"
  local dst="$HOME/.local/bin/terminal-title"
  if [[ -e "$dst" && ! -L "$dst" && "$NON_INTERACTIVE" == false ]]; then
    read -rp "Overwrite $dst? [y/N] " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "  Skipped $dst"
      return
    fi
  fi
  rm -f "$dst"
  cp "$REPO_SCRIPTS_DIR/terminal-title.sh" "$dst"
}

uninstall() {
  echo "Removing scripts..."
  local target="$HOME/.local/bin/terminal-title"
  if [[ -e "$target" ]]; then
    rm -f "$target"
  fi
}

for arg in "$@"; do
  case "$arg" in
    --yes|-y) NON_INTERACTIVE=true ;;
  esac
done

cmd="${1:-install}"
case "$cmd" in
  install)   install ;;
  uninstall) uninstall ;;
  *)         echo "Unknown command: $cmd"; exit 1 ;;
esac
