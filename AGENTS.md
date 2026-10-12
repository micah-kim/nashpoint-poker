# AGENTS.md

Operational guide for Codex and other repository agents.

This repo started with a Copilot-driven scaffold, but `AGENTS.md` is now the working source of truth for agent behavior. If a legacy document conflicts with the code, prefer the code first, then this file, then the rest of the docs.

## Product Boundary

- This repository is a marketing site for Nash Point, not the full poker training product.
- Keep the homepage mockups in `components/mockups/` presentational unless a task explicitly asks for product logic.
- The `/demo` spot trainer is the one exception: it runs real strategy logic, but only over hand-authored static data in `lib/spots.ts`. Keep it offline -- no solver, no API calls.
- Spots are authored in street order, preflop through river, because the coverage grid and the pick-the-read walkthrough both render them in that order.
- Within a spot, actions are authored from the most passive line to the most aggressive one. The index is an aggression rank, and `missDirection` reads it to say whether a wrong answer was too passive or too aggressive. Re-ordering a spot's actions silently changes that diagnosis.
- A drill can be focused on one street. A street with fewer pairings than `DRILL_LENGTH` deals a shorter drill rather than borrowing hands from another street.
- Drill mode seeds its deal from the clock inside an event handler, never during render. Randomising in render would break hydration.
- Drill mode deals from the coverage grid rather than uniformly: untested pairings first, then the ones still open, then the ones due for review, then the ones answered right once, then the proven ones. Due sits ahead of answered-right-once because it is the tier that is actually overdue. The order inside a tier is seeded, so a drill stays reproducible.
- A pairing is only `mastered` after `MASTERY_REPS` consecutive optimal answers; one clean answer leaves it `learning`. A spot offers two to four lines, so a single correct answer is inside guessing range. A miss resets the run to zero rather than denting it.
- Mastery expires. `buildCoverage` takes an optional `now`, and a pairing proven longer ago than `masteryFreshDays(streak)` comes back as `stale` -- due for review, not a leak. Each clean rep past `MASTERY_REPS` doubles that window up to `MASTERY_FRESH_CAP_DAYS`.
- Nothing ages without a `now`, and nothing ages without a date on the row. A live session passes neither, so it never goes stale mid-run; only the stored history, whose rows are stamped with their session's `completedAt`, can expire. That is also the hydration guard -- see the clock note below.
- The demo reads the ageing clock into state in the mount effect and refreshes it when a session is recorded, never during render. `summarizeCareer` without a `now` is the server-rendered case, and it must stay the un-aged one or the first client render will not match.
- `planNextSession` names the one queue to train next and ranks by `coveragePriority`, the same order `buildCoverageDrill` deals in. Keep them on that one order, or the recommendation and the deal will disagree. It is deliberately blind to the street focus and deals over the whole grid.
- The plan takes no seed and deals no hands, so it can be derived during render. The handler it starts is what reads the clock.
- Closing a leak and proving a pairing are deliberately different bars: `summarizeLeakProgress` closes a leak on one clean answer, `buildCoverage` proves a pairing on two. Do not collapse them -- the gap between the two is what the confirm drill deals.
- The recap's retry drill re-deals the missed spot/read pairings from the session's own grades, so it stays deterministic.
- The career rollup and the session log answer two different questions and must not be collapsed. `summarizeCareer` pools every answer ever given, which is "where do I stand"; `summarizeForm` keeps the sessions apart, which is the only way to say "am I getting better" -- a lifetime percentage averages over a history that only grows, so it stops moving.
- The form trend compares the last `FORM_WINDOW_SESSIONS` sessions against the window immediately before them, pooled by answer rather than averaged by session, so a two-hand street drill cannot swing it. With nothing on the far side of the window the trend is null, not zero: "no comparison" is not "no change".
- `summarizeForm` only dates its entries when it is given a `now`, the same hydration rule `buildCoverage` follows. The server-rendered case is the undated one, and the log drops its relative dates rather than guessing at them.
- Training history is `localStorage` only -- no account and no network. `lib/progress.ts` parses it defensively, because a grade pointing at a spot or action that a later deploy removed would make `reviewSession` throw.
- A stored session stamped ahead of the clock is clamped to zero days old rather than trusted, so a skewed clock cannot buy a pairing extra freshness.
- Read storage in an effect, never during render, and write a finished session from the handler that ends it.
- The waitlist flow is the only live backend behavior in this repo.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Neon Postgres via `@neondatabase/serverless`

## First Places To Look

- `README.md` for setup and repo overview
- `lib/content.ts` for centralized marketing copy
- `tailwind.config.ts` and `DESIGN_TOKENS.md` for brand tokens and styling rules
- `app/page.tsx` and the landing-page sections in `components/`
- `components/WaitlistForm.tsx`, `app/api/waitlist/route.ts`, and `lib/validation.ts` for the signup flow and its shared validation
- `lib/spots.ts` and `lib/trainer.ts` for the `/demo` spot trainer data, grading, coverage, mastery reps and their expiry, per-street progress, drill dealing and focusing, retry, confirm, review and tendency drills, the next-up recommendation, miss-direction diagnosis, leak tracking, and session review
- `lib/progress.ts` for the persisted training history, the lifetime career rollup behind the demo's career card, coverage grid and miss-direction panel, and the session-by-session log and rolling form trend behind the recent-form panel
- `lib/validation.test.ts`, `lib/trainer.test.ts`, and `lib/progress.test.ts` for the Vitest suites covering validation, trainer logic, and persistence
- `system-architecture.md` for future-state context only

## Working Conventions

- Keep route files small and move reusable UI into `components/`.
- Reuse primitives from `components/ui/` before introducing new one-off patterns.
- Prefer updating shared copy in `lib/content.ts` instead of scattering strings across components.
- Use Tailwind `brand-*` tokens instead of inline hex values.
- Route Lucide icons through `components/ui/Icon.tsx` when possible.
- Keep new UI responsive and mobile-first.
- Preserve the current warm, high-stakes visual direction unless the task is explicitly a redesign.

## Waitlist Notes

- `DATABASE_URL` is required for the waitlist API.
- Expected request payload: `{ name, email, notes }`
- `GET /api/waitlist` is a development/debug endpoint for inspecting entries.

## Docs To Keep In Sync

- Update `README.md` and `COMMANDS.md` when setup, scripts, or environment requirements change.
- Update `DESIGN_TOKENS.md` when tokens or visual conventions change.
- Update `project-specification.md` and `ui-wireframes.md` when user-facing scope or layout changes.
- Update `STRUCTURE.md` when files move or major responsibilities shift.

## Commands

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run lint:fix`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check`

## Legacy Docs

- `COPILOT_OVERVIEW.md`, `COPILOT_USAGE_GUIDE.md`, and `copilot-prompt.md` are historical context from the earlier Copilot workflow.
- Keep any useful product history from those files, but do not treat them as the active operating instructions.
