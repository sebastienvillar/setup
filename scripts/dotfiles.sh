#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOTFILES_DIR="$SCRIPT_DIR/../dotfiles"
BACKUP_BASE="$HOME/.dotfiles-backup"
DEVBOX=false

source "$SCRIPT_DIR/lib.sh"

install_zsh() {
  echo "Installing zsh config..."
  if [[ ! -d "$HOME/.oh-my-zsh" ]]; then
    echo "Installing Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
  fi
  if [[ ! -d "$HOME/.oh-my-zsh/custom/plugins/zsh-autosuggestions" ]]; then
    echo "Installing zsh-autosuggestions..."
    git clone https://github.com/zsh-users/zsh-autosuggestions "$HOME/.oh-my-zsh/custom/plugins/zsh-autosuggestions"
  fi
  if [[ ! -d "$HOME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" ]]; then
    echo "Installing zsh-syntax-highlighting..."
    git clone https://github.com/zsh-users/zsh-syntax-highlighting "$HOME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting"
  fi
  copy "$DOTFILES_DIR/zsh/zshrc" "$HOME/.zshrc"
}

install_git() {
  echo "Installing git config..."
  if [[ "$DEVBOX" == true ]]; then
    copy "$DOTFILES_DIR/git/gitconfig-devbox" "$HOME/.gitconfig"
  else
    copy "$DOTFILES_DIR/git/gitconfig" "$HOME/.gitconfig"
  fi

  if [[ ! -f "$HOME/.gitconfig.local" ]]; then
    printf '[user]\n\temail = \n' > "$HOME/.gitconfig.local"
    echo "Created ~/.gitconfig.local — set your email there."
  fi
}

install_claude() {
  echo "Installing Claude settings..."
  mkdir -p "$HOME/.claude"
  if [[ "$DEVBOX" == true ]]; then
    echo "Using devbox Claude settings..."
    copy "$DOTFILES_DIR/claude/settings-devbox.json" "$HOME/.claude/settings.json"
  else
    copy "$DOTFILES_DIR/claude/settings.json" "$HOME/.claude/settings.json"
  fi
  for item in "$DOTFILES_DIR/claude"/*; do
    local name
    name="$(basename "$item")"
    case "$name" in
      settings.json|settings-devbox.json) continue ;;
    esac
    copy "$item" "$HOME/.claude/$name"
  done
}

uninstall() {
  echo "Removing dotfiles..."
  safe_remove "$HOME/.zshrc"
  safe_remove "$HOME/.gitconfig"

  safe_remove "$HOME/.claude/settings.json"
  for item in "$DOTFILES_DIR/claude"/*; do
    local name
    name="$(basename "$item")"
    case "$name" in
      settings.json|settings-devbox.json) continue ;;
    esac
    safe_remove "$HOME/.claude/$name"
  done
  echo "Done. Dotfiles removed."
}

restore() {
  uninstall
  restore_from_backup
}

install_all() {
  init_backup
  install_zsh
  install_git
  install_claude
}

show_help() {
  echo "Usage: $(basename "$0") [command]"
  echo ""
  echo "Commands:"
  echo "  install     Install all dotfiles (default)"
  echo "  zsh         Install zsh config"
  echo "  git         Install git config"
  echo "  claude      Install Claude settings"
  echo "  uninstall   Remove installed dotfiles"
  echo "  restore     Restore files from latest backup"
  echo "  help        Show this help"
  echo ""
  echo "Flags:"
  echo "  --devbox      Set Claude to bypass permissions mode"
  echo "  --no-backup   Skip backing up existing files"
}

for arg in "$@"; do
  case "$arg" in
    --devbox) DEVBOX=true ;;
    --no-backup) NO_BACKUP=true ;;
    --yes|-y) NON_INTERACTIVE=true ;;
  esac
done

cmd="${1:-install}"
case "$cmd" in
  install)   install_all ;;
  zsh)       install_zsh ;;
  git)       install_git ;;
  claude)    install_claude ;;
  uninstall) uninstall ;;
  restore)   restore ;;
  help)      show_help ;;
  --devbox)  install_all ;;
  *)         echo "Unknown command: $cmd"; show_help; exit 1 ;;
esac
