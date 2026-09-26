# Nash Point

Marketing site for Nash Point, an AI poker training product concept that combines GTO fundamentals with exploitative adjustments.

## Working With Codex

Start with `AGENTS.md`. This repo was originally scaffolded during a Copilot-driven phase, so a few legacy Copilot docs still exist for historical context, but `AGENTS.md`, the current code, and the scripts in `package.json` are the operational source of truth.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- Neon Postgres via `@neondatabase/serverless`

## Quick Start

1. Install dependencies:
```bash
npm install
```
2. Create a local env file:
```bash
cp .env.example .env.local
```
3. Set `DATABASE_URL` in `.env.local`.
4. Start the development server:
```bash
npm run dev
```
5. Open `http://localhost:3000`.

## Environment Variables

- `DATABASE_URL` - required for the waitlist API
- `NEXT_PUBLIC_BASE_URL` - optional base URL for canonical metadata, sitemap generation, and Open Graph tags

## Commands

- `npm run dev` - start local development
- `npm run lint` - run ESLint
- `npm run lint:fix` - auto-fix lintable issues
- `npm run typecheck` - run TypeScript without emitting files
- `npm run test` - run the Vitest suite
- `npm run build` - create a production build
- `npm run check` - run the full validation flow used during agent work

## Project Structure

- `app/` - App Router pages, metadata, and the waitlist API route
- `components/` - page sections, navigation, footer, mockups, and shared UI primitives
- `lib/content.ts` - centralized marketing copy and structured content
- `public/assets/images/` - logo and social share images
- `tailwind.config.ts` - brand tokens used across the site

## Key Routes

- `/` - landing page
- `/about` - vision and positioning
- `/demo` - interactive spot trainer (client-side, no backend)
- `/early-access` - waitlist signup page
- `/api/waitlist` - waitlist POST plus debug GET endpoint

## Waitlist API

`POST /api/waitlist`

```json
{
  "name": "Test User",
  "email": "user@example.com",
  "notes": "Optional feedback"
}
```

`GET /api/waitlist`

Returns the current entries for development/debugging.

Schema setup lives in `schema.sql`, and Neon-specific setup notes live in `NEON_SETUP.md`.

## Design System

The current visual direction is warm, dark, and high-contrast:

- warm black backgrounds
- orange and gold accents
- Tailwind `brand-*` tokens defined in `tailwind.config.ts`

Update `DESIGN_TOKENS.md` whenever tokens or brand rules change.

## Deployment

The app is ready for Vercel. Set the same environment variables in Vercel that you use locally, especially `DATABASE_URL`.

## Additional Docs

- `AGENTS.md` - Codex-first working guide
- `COMMANDS.md` - common development and validation commands
- `QUICKSTART.md` - shortest path to running the app locally
- `DESIGN_TOKENS.md` - styling tokens and brand rules
- `project-specification.md` - product and scope reference
- `system-architecture.md` - future-state architecture notes
- `ui-wireframes.md` - layout and content intent

## License

Private project. All rights reserved.
