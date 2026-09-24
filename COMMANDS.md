# Commands

This is the shortest command reference for day-to-day work on the repo.

## Setup

```bash
npm install
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local` before testing the waitlist flow.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run lint:fix
npm run typecheck
npm run test
npm run build
npm run check
```

Use `npm run check` when you want the highest-signal validation pass before handing work off.

## Waitlist Smoke Test

```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","notes":"Interested in hand reviews"}'

curl http://localhost:3000/api/waitlist
```

## Useful Files

- `AGENTS.md` - Codex-first repo guidance
- `lib/content.ts` - centralized marketing copy
- `tailwind.config.ts` - brand tokens
- `components/WaitlistForm.tsx` - form UI and client-side submission flow
- `app/api/waitlist/route.ts` - Neon-backed waitlist endpoint

## Troubleshooting

```bash
npx kill-port 3000
rm -rf .next
rm -rf node_modules && npm install
```
