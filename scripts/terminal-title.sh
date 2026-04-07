#!/bin/bash
# Sets the terminal title with optional coder and claude indicators.
# Usage: terminal-title.sh [working|stopped|waiting]
#   working  - Claude is processing (🤖)
#   stopped  - Claude is done (⏸️)
#   waiting  - Claude needs input (🔔)
#   (empty)  - No claude session

claude_state="${1:-}"

# --- Coder emoji ---
coder_emoji=""
if [[ -n "${FIGMA_CODER_WORKSPACE_NAME:-}" ]]; then
  case "$FIGMA_CODER_WORKSPACE_NAME" in
    red)     coder_emoji="🔴";;
    orange)  coder_emoji="🟠";;
    yellow)  coder_emoji="🟡";;
    green)   coder_emoji="🟢";;
    blue)    coder_emoji="🔵";;
    purple)  coder_emoji="🟣";;
    brown)   coder_emoji="🟤";;
    black)   coder_emoji="⚫";;
    white)   coder_emoji="⚪";;
    *)
      emojis=("🔴" "🟠" "🟡" "🟢" "🔵" "🟣" "🟤")
      hash=$(echo -n "$FIGMA_CODER_WORKSPACE_NAME" | cksum | awk '{print $1}')
      coder_emoji="${emojis[$((hash % ${#emojis[@]}))]}";;
  esac
fi

# --- Claude indicator ---
claude_emoji=""
case "$claude_state" in
  working) claude_emoji="🤖";;
  stopped) claude_emoji="⏸️";;
  waiting) claude_emoji="🔔";;
esac

# --- Build prefix ---
prefix=""
if [[ -n "$coder_emoji" && -n "$claude_emoji" ]]; then
  prefix="${coder_emoji}${claude_emoji} "
elif [[ -n "$coder_emoji" ]]; then
  prefix="${coder_emoji} "
elif [[ -n "$claude_emoji" ]]; then
  prefix="${claude_emoji} "
fi

# --- Location ---
if [[ -n "${FIGMA_CODER_WORKSPACE_NAME:-}" ]]; then
  # Coder: just show the branch
  location=$(git symbolic-ref --short HEAD 2>/dev/null || basename "${PWD:-}")
else
  # Local: show directory, with branch in parentheses if in a git repo
  dir=$(basename "${PWD:-}")
  branch=$(git symbolic-ref --short HEAD 2>/dev/null)
  if [[ -n "$branch" ]]; then
    location="${dir} (${branch})"
  else
    location="$dir"
  fi
fi

# --- Set title ---
tty_device=$(tty 2>/dev/null) || tty_device="/dev/tty"
printf '\e]2;%s%s\a' "$prefix" "$location" > "$tty_device"
printf '\e]1;%s%s\a' "$prefix" "$location" > "$tty_device"
