#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Restoring dotfiles..."
bash "$SCRIPT_DIR/scripts/dotfiles.sh" restore

echo "==> Restoring editor configs..."
bash "$SCRIPT_DIR/scripts/configs.sh" restore

echo "==> All done."
