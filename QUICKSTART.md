# Quick Start

## 1. Install

```bash
npm install
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local`.

## 2. Run The App

```bash
npm run dev
```

Open `http://localhost:3000`.

## 3. Know The Main Surfaces

- `/` - landing page
- `/about` - product vision and roadmap
- `/demo` - non-functional product mockup
- `/early-access` - waitlist form
- `/api/waitlist` - debug endpoint for current waitlist entries

## 4. Smoke Test The Waitlist

1. Open `http://localhost:3000/early-access`
2. Submit a test name, email, and optional notes
3. Confirm success in the UI
4. Open `http://localhost:3000/api/waitlist` to verify the entry

## 5. Validate Before Shipping Changes

```bash
npm run check
```

## 6. Need More Context?

- `AGENTS.md` - repo-specific guidance for Codex and other agents
- `README.md` - setup, architecture, and deployment notes
- `DESIGN_TOKENS.md` - brand tokens and styling rules
- `project-specification.md` - scope and product intent
