# Project memory

Long-lived project context lives in your Obsidian vault, not in this file. A
SessionStart hook auto-loads notes from `~/Documents/Obsidian/Smartshopper/`
into every new Claude Code session.

## How it works

- Hook: `.claude/hooks/load-obsidian-memory.sh`
- Registered in: `.claude/settings.json` (`hooks.SessionStart`)
- Vault root: `$OBSIDIAN_VAULT` (defaults to `~/Documents/Obsidian`)
- Scope folder: `$OBSIDIAN_SCOPE` (defaults to `Smartshopper`)
- Token cap: `$OBSIDIAN_MAX_BYTES` (defaults to `12000` bytes)

Notes are loaded newest-first by file mtime. YAML front-matter is stripped.
When the cap is hit, the remaining notes are listed by path only — Claude
reads them on demand instead of preloading.

## Adding memory

Edit markdown files under `~/Documents/Obsidian/Smartshopper/`. Suggested
seed notes:

- `decisions.md` — architectural decisions and rationale
- `conventions.md` — code style, patterns, naming
- `roadmap.md` — milestone status, what's blocked
- `gotchas.md` — non-obvious behaviour, workarounds

New notes appear in the next session.

## Tuning

```bash
export OBSIDIAN_VAULT="$HOME/path/to/vault"
export OBSIDIAN_SCOPE="Smartshopper"
export OBSIDIAN_MAX_BYTES=8000   # tighter cap
```
