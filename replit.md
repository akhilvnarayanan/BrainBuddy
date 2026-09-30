# BrightSprout

BrightSprout is an offline-first activity and learning playground for children
aged 6+, combining short math, memory, pattern, and focus games with gentle
progress rewards.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kids-activity-learning/` — the BrightSprout React/Vite app
- `artifacts/kids-activity-learning/src/App.tsx` — activity state, progress, and
  the main application shell
- `artifacts/kids-activity-learning/src/index.css` — visual system and
  responsive styling
- `artifacts/kids-activity-learning/docs/SOURCE-ANALYSIS.md` — repository
  review and license boundaries
- `artifacts/kids-activity-learning/docs/ATTRIBUTIONS.md` — source links and
  attribution notice

## Architecture decisions

- The first release is local-only: there are no accounts, ads, social features,
  or leaderboards.
- Activity mechanics are original implementations informed by the reviewed
  repositories; unlicensed code and media were not copied.
- Progress is intentionally positive and lightweight: stars and streaks
  encourage practice without deducting progress for mistakes.

## Product

- A home trail with four focused activities: Memory Match, Number Quest,
  Pattern Path, and Focus Safari.
- Playable activity flows with restart, back navigation, score feedback, and
  completion states.
- Local persistence for completed activities, best scores, streak, settings,
  and weekly practice minutes.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
