# Conventions

## Code

- TypeScript strict. No `any`. Prefer narrow types + Zod at boundaries.
- Comments explain *why*, not *what*. Don't narrate the obvious.
- No fake/placeholder data shipped to users — real values or clearly
  labelled estimates only.
- Don't add abstractions, fallbacks, or error handling for cases that
  can't happen. Trust internal code; validate at system boundaries.
- The optimiser in `packages/core` is sealed — change pricing via
  `buildOffers()`, not the optimiser.

## Verify before shipping

```
pnpm --filter @smartshopper/web typecheck
pnpm --filter @smartshopper/web build
pnpm -r --filter '@smartshopper/core' --filter '@smartshopper/types' --filter '@smartshopper/scraper' test
```

## Git

- `main` is protected — no direct pushes. Branch → PR → squash-merge.
- Branch names: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- One logical change per PR. PR body: summary + test plan.
- Never commit secrets. Env values live in Vercel, documented in
  `apps/web/.env.example`.

## Deploys

- Vercel auto-deploys `main` to production and every branch to a preview.
- `NEXT_PUBLIC_*` vars are inlined at build time — use plain runtime
  vars for anything server-side.
