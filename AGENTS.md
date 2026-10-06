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
- Drill mode deals from the coverage grid rather than uniformly: untested pairings first, then the ones still open, then the proven ones. The order inside a tier is seeded, so a drill stays reproducible.
- The recap's retry drill re-deals the missed spot/read pairings from the session's own grades, so it stays deterministic.
- Training history is `localStorage` only -- no account and no network. `lib/progress.ts` parses it defensively, because a grade pointing at a spot or action that a later deploy removed would make `reviewSession` throw.
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
- `lib/spots.ts` and `lib/trainer.ts` for the `/demo` spot trainer data, grading, coverage, per-street progress, drill dealing and focusing, retry and tendency drills, miss-direction diagnosis, leak tracking, and session review
- `lib/progress.ts` for the persisted training history and the lifetime career rollup behind the demo's career card, coverage grid, and miss-direction panel
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
