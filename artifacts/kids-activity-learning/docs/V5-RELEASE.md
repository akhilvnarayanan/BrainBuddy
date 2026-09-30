# BrainBuddy V5

## Focus

V5 is a product-quality pass over the existing 23-activity age 6–7 experience. It keeps the activity set intentionally small while improving the learning loop and progress model.

## Included

- BrainBuddy branding replaces the previous BrightSprout product name in the main app.
- Calendar-based day streaks instead of counting every new activity as a streak day.
- Weekly practice minutes now reset automatically when a new local week starts.
- Repeat plays count as sessions but do not award duplicate completion stars.
- Daily challenge rotates deterministically by local calendar day.
- Existing completion history, best scores, recent activity, and skill scores remain compatible with the previous local storage format.
- Package version updated to 0.5.0.

## Age 6–7 guardrails

- Keep activities short and single-step.
- Prefer recognition, visual choices, and simple interaction over typing.
- Keep mistakes low-pressure.
- Avoid advanced terminology and multi-step deduction.
- Keep creative tasks open-ended rather than grading artistic quality.

## Verification

The changes were applied to the v5-next branch from the current main source. A full Replit pnpm typecheck and production build should be run in the Replit environment before merging because this connector does not execute the workspace package scripts.
