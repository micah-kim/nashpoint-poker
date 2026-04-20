# Neon Database Setup

The waitlist API uses Neon Postgres through `@neondatabase/serverless`.

## 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and set `DATABASE_URL`.

Set the same `DATABASE_URL` in Vercel for production.

## 2. Create The Table

Run `schema.sql` in Neon SQL Editor, or execute the equivalent SQL:

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
```

## 3. Test Locally

```bash
npm run dev
```

Then:

1. Visit `http://localhost:3000/early-access`
2. Submit a test entry with name, email, and optional notes
3. Open `http://localhost:3000/api/waitlist`

## Current Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `name` | VARCHAR(255) | Required display name |
| `email` | VARCHAR(255) | Unique email address |
| `notes` | TEXT | Optional user feedback |
| `created_at` | TIMESTAMP | Auto-set signup timestamp |

## Troubleshooting

- Verify `DATABASE_URL` in `.env.local`
- Restart the dev server after changing env vars
- Make sure the `waitlist` table exists before testing the form
- Check duplicate emails with `SELECT * FROM waitlist WHERE email = 'user@example.com';`
