#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOTFILES_ARGS="install"
CONFIGS_ARGS="install"
NON_INTERACTIVE=false
RUN_BREW=false
RUN_DOTFILES=false
RUN_CONFIGS=false

for arg in "$@"; do
  case "$arg" in
    --brew) RUN_BREW=true ;;
    --dotfiles) RUN_DOTFILES=true ;;
    --configs) RUN_CONFIGS=true ;;
    --devbox) DOTFILES_ARGS="$DOTFILES_ARGS --devbox" ;;
    --no-backup) DOTFILES_ARGS="$DOTFILES_ARGS --no-backup"; CONFIGS_ARGS="$CONFIGS_ARGS --no-backup" ;;
    --yes|-y) NON_INTERACTIVE=true ;;
  esac
done

# If no specific step is selected, run all
if [[ "$RUN_BREW" == false && "$RUN_DOTFILES" == false && "$RUN_CONFIGS" == false ]]; then
  RUN_BREW=true
  RUN_DOTFILES=true
  RUN_CONFIGS=true
fi

if [[ "$NON_INTERACTIVE" == false ]]; then
  echo "This will install Homebrew packages, dotfiles, and editor configs."
  read -rp "Are you sure you want to continue? [y/N] " answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

if [[ "$RUN_BREW" == true ]]; then
  echo "==> Installing Homebrew packages..."
  bash "$SCRIPT_DIR/scripts/brew.sh"
fi

if [[ "$RUN_DOTFILES" == true ]]; then
  echo "==> Installing dotfiles..."
  bash "$SCRIPT_DIR/scripts/dotfiles.sh" $DOTFILES_ARGS
fi

if [[ "$RUN_CONFIGS" == true ]]; then
  echo "==> Installing editor configs..."
  bash "$SCRIPT_DIR/scripts/configs.sh" $CONFIGS_ARGS
fi

echo "==> All done! Restart your shell or run: source ~/.zshrc"
