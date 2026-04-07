#!/bin/bash

# Shared helpers for dotfiles and configs scripts.
# Source this file and set BACKUP_BASE before using.

NO_BACKUP="${NO_BACKUP:-false}"

backup() {
  local file="$1"
  if [[ "$NO_BACKUP" == true ]]; then
    return
  fi
  if [[ -e "$file" ]]; then
    mkdir -p "$BACKUP_DIR"
    local relative="${file#$HOME/}"
    local backup_path="$BACKUP_DIR/$relative"
    mkdir -p "$(dirname "$backup_path")"
    cp "$file" "$backup_path"
    echo "  Backed up $file"
  fi
}

copy() {
  local src="$1" dst="$2"
  backup "$dst"
  cp "$src" "$dst"
}

safe_remove() {
  local file="$1"
  if [[ -e "$file" || -L "$file" ]]; then
    rm -f "$file"
  fi
}

restore_from_backup() {
  local latest
  latest=$(ls -dt "$BACKUP_BASE"/*/ 2>/dev/null | head -1)
  if [[ -z "$latest" ]]; then
    echo "No backups found in $BACKUP_BASE"
    exit 1
  fi
  echo "Restoring from $latest ..."
  while IFS= read -r file; do
    local relative="${file#$latest}"
    local target="$HOME/$relative"
    mkdir -p "$(dirname "$target")"
    cp "$file" "$target"
    echo "  Restored $target"
  done < <(find "$latest" -type f)
  echo "Done. Restored from backup."
}

init_backup() {
  BACKUP_DIR="$BACKUP_BASE/$(date +%Y%m%d-%H%M%S)"
}
