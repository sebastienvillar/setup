#!/bin/bash

set -euo pipefail

npx --yes github:figma/paste#v0.5.2 setup --no-login

# paste setup registers its MCP for Codex, Claude, and Figaro but not Pi.
# Copy the Figaro entry, which setup always writes, so Pi launches the same pinned runtime.
python3 - "$HOME/.config/figaro/mcp.json" "$HOME/.pi/agent/mcp.json" <<'PY'
from pathlib import Path
import json
import os
import sys
import tempfile

figaro_path, pi_path = map(Path, sys.argv[1:])
paste = json.loads(figaro_path.read_text())["mcpServers"]["paste"]
config = json.loads(pi_path.read_text()) if pi_path.exists() else {}
config.setdefault("mcpServers", {})["paste"] = {"command": paste["command"], "args": paste["args"]}

pi_path.parent.mkdir(parents=True, exist_ok=True)
fd, temporary = tempfile.mkstemp(dir=pi_path.parent, prefix=".mcp-")
try:
    with os.fdopen(fd, "w") as pending:
        pending.write(json.dumps(config, indent=2) + "\n")
    os.chmod(temporary, 0o600)
    os.replace(temporary, pi_path)
finally:
    Path(temporary).unlink(missing_ok=True)
PY
