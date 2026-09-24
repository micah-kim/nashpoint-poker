# AGENTS.md

Operational guide for Codex and other repository agents.

This repo started with a Copilot-driven scaffold, but `AGENTS.md` is now the working source of truth for agent behavior. If a legacy document conflicts with the code, prefer the code first, then this file, then the rest of the docs.

## Product Boundary

- This repository is a marketing site for Nash Point, not the full poker training product.
- Keep mockups presentational unless a task explicitly asks for product logic.
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
- `lib/validation.test.ts` for the Vitest suite covering that validation logic
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
