# BrainBuddy

BrainBuddy is an offline-first Kids Learning & Brain Development Platform for
children aged 6+, combining 23 short missions across mathematics, memory, logic,
focus, creativity, language, reading, science, design, music, mystery, and
arcade-style learning with gentle progress rewards.

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

- `artifacts/kids-activity-learning/` — the BrainBuddy React/Vite app
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

- A learning academy with 23 filtered missions, featured pathways, a daily
  challenge, search, difficulty labels, and responsive navigation.
- Multiple playable formats including memory matching, mathematics and language
  questions, pattern reasoning, visual focus, reaction timing, freehand drawing,
  story choices, reading comprehension, spatial navigation, design decisions,
  evidence boards, rhythm tapping, and arcade target scanning.
- Playable activity flows with restart, back navigation, score feedback, and
  completion states.
- Local persistence for completed activities, best scores, streak, settings,
  and weekly practice minutes.
- V5 progress logic records real calendar-day streaks, resets the weekly goal by local week, and keeps repeat plays as learning sessions without awarding duplicate completion stars.
- V5 selects a deterministic daily challenge that changes each local day.
- Product branding is BrainBuddy; the current release targets ages 6–7.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
