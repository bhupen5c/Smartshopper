#!/usr/bin/env bash
# SessionStart hook: load Smartshopper notes from the Obsidian vault.
# Token-budget: cap combined output at MAX_BYTES; over the cap fall back to a
# title-only index so the session never balloons.

set -euo pipefail

VAULT="${OBSIDIAN_VAULT:-$HOME/Documents/Obsidian}"
SCOPE="${OBSIDIAN_SCOPE:-Smartshopper}"
ROOT="$VAULT/$SCOPE"
MAX_BYTES="${OBSIDIAN_MAX_BYTES:-12000}"

emit() {
  # $1 = additionalContext string
  python3 -c "import json,sys; print(json.dumps({'hookSpecificOutput':{'hookEventName':'SessionStart','additionalContext':sys.stdin.read()}}))" <<<"$1"
}

if [ ! -d "$ROOT" ]; then
  emit "Obsidian memory: vault folder '$ROOT' not found. Create it and add .md notes to enable project memory."
  exit 0
fi

# Collect markdown files, newest first (mtime), excluding .obsidian/ internals.
mapfile -t FILES < <(find "$ROOT" -type f -name '*.md' -not -path '*/.obsidian/*' -printf '%T@\t%p\n' 2>/dev/null | sort -rn | cut -f2-)

if [ "${#FILES[@]}" -eq 0 ]; then
  emit "Obsidian memory: '$ROOT' has no .md notes yet."
  exit 0
fi

BUF=$'# Obsidian memory ('"$SCOPE"$') — auto-loaded\n\nSource: `'"$ROOT"$'` · cap: '"$MAX_BYTES"$'B · sorted by recency.\n\n'
SIZE=${#BUF}
INCLUDED=0
TRUNCATED=()

for f in "${FILES[@]}"; do
  rel="${f#$VAULT/}"
  # Strip YAML front-matter to save tokens.
  body="$(awk 'BEGIN{fm=0} NR==1 && /^---[[:space:]]*$/ {fm=1; next} fm && /^---[[:space:]]*$/ {fm=0; next} !fm {print}' "$f")"
  chunk=$'\n## '"$rel"$'\n\n'"$body"$'\n'
  add=${#chunk}
  if (( SIZE + add > MAX_BYTES )); then
    TRUNCATED+=("$rel")
    continue
  fi
  BUF+="$chunk"
  SIZE=$(( SIZE + add ))
  INCLUDED=$(( INCLUDED + 1 ))
done

if [ "${#TRUNCATED[@]}" -gt 0 ]; then
  BUF+=$'\n---\n\n## Not loaded (over cap) — read on demand:\n'
  for rel in "${TRUNCATED[@]}"; do BUF+="- \`$VAULT/$rel\`"$'\n'; done
fi

BUF+=$'\n_Update notes: edit files under `'"$ROOT"$'`. New sessions reload them._\n'

emit "$BUF"
