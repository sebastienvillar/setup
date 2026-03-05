#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIGS_DIR="$SCRIPT_DIR/../configs"
BACKUP_BASE="$HOME/.configs-backup"

source "$SCRIPT_DIR/lib.sh"

# Editor settings paths vary by OS
if [[ "$(uname -s)" == "Darwin" ]]; then
  CURSOR_SETTINGS_DIR="$HOME/Library/Application Support/Cursor/User"
  VSCODE_SETTINGS_DIR="$HOME/Library/Application Support/Code/User"
else
  CURSOR_SETTINGS_DIR="$HOME/.config/Cursor/User"
  VSCODE_SETTINGS_DIR="$HOME/.config/Code/User"
fi

install_cursor() {
  echo "Installing Cursor settings..."
  mkdir -p "$CURSOR_SETTINGS_DIR"
  link "$CONFIGS_DIR/cursor/settings.json" "$CURSOR_SETTINGS_DIR/settings.json"
  link "$CONFIGS_DIR/cursor/keybindings.json" "$CURSOR_SETTINGS_DIR/keybindings.json"
}

install_vscode() {
  echo "Installing VS Code settings..."
  mkdir -p "$VSCODE_SETTINGS_DIR"
  link "$CONFIGS_DIR/vscode/settings.json" "$VSCODE_SETTINGS_DIR/settings.json"
  link "$CONFIGS_DIR/vscode/keybindings.json" "$VSCODE_SETTINGS_DIR/keybindings.json"
}

uninstall() {
  echo "Removing config symlinks..."
  safe_unlink "$CURSOR_SETTINGS_DIR/settings.json"
  safe_unlink "$CURSOR_SETTINGS_DIR/keybindings.json"
  safe_unlink "$VSCODE_SETTINGS_DIR/settings.json"
  safe_unlink "$VSCODE_SETTINGS_DIR/keybindings.json"
  echo "Done. Config symlinks removed."
}

restore() {
  uninstall
  restore_from_backup
}

install_all() {
  init_backup
  install_cursor
  install_vscode
}

show_help() {
  echo "Usage: $(basename "$0") [command]"
  echo ""
  echo "Commands:"
  echo "  install     Install all editor configs (default)"
  echo "  cursor      Install Cursor editor settings"
  echo "  vscode      Install VS Code editor settings"
  echo "  uninstall   Remove config symlinks"
  echo "  restore     Restore files from latest backup"
  echo "  help        Show this help"
  echo ""
  echo "Flags:"
  echo "  --no-backup   Skip backing up existing files"
}

for arg in "$@"; do
  case "$arg" in
    --no-backup) NO_BACKUP=true ;;
  esac
done

cmd="${1:-install}"
case "$cmd" in
  install)     install_all ;;
  cursor)      install_cursor ;;
  vscode)      install_vscode ;;
  uninstall)   uninstall ;;
  restore)     restore ;;
  help)        show_help ;;
  --no-backup) install_all ;;
  *)           echo "Unknown command: $cmd"; show_help; exit 1 ;;
esac
