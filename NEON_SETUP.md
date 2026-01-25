# Neon Database Setup Guide

## ✅ Complete! Your waitlist is now using Neon Postgres

### What's Been Done

1. ✅ `.env.local` created with your DATABASE_URL
2. ✅ `@neondatabase/serverless` driver installed
3. ✅ API route updated to use Neon Postgres
4. ✅ Database schema created (`schema.sql`)
5. ✅ Documentation updated

---

## 🚀 Next Steps

### 1. Create the Database Table

Go to **Neon SQL Editor** and run the SQL from `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
```

**How to access Neon SQL Editor:**
- Vercel Dashboard → Storage → Your Neon DB → "Open in Neon Console"
- Or go to [console.neon.tech](https://console.neon.tech)

---

### 2. Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000/early-access

Submit a test email and check:
- Console logs for confirmation
- Neon SQL Editor: `SELECT * FROM waitlist;`

---

### 3. Deploy to Vercel

The `DATABASE_URL` is already set in Vercel (from Neon integration), so just:

```bash
git add .
git commit -m "Add Neon Postgres for waitlist storage"
git push
```

Vercel will automatically redeploy with the database integration!

---

## 📊 Database Schema

**Table:** `waitlist`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `email` | VARCHAR(255) | User email (unique, lowercase) |
| `notes` | TEXT | Optional user feedback |
| `created_at` | TIMESTAMP | Auto-set to current time |

**Indexes:**
- Email (for fast duplicate checks)
- Created_at (for sorting)

---

## 🔍 View Your Waitlist

### Via API:
```
GET http://localhost:3000/api/waitlist
```

### Via SQL:
```sql
SELECT * FROM waitlist ORDER BY created_at DESC;
```

### Export to CSV:
```sql
COPY (SELECT email, notes, created_at FROM waitlist ORDER BY created_at DESC) 
TO STDOUT WITH CSV HEADER;
```

---

## ✨ Features

✅ **Persistent storage** - Data survives server restarts  
✅ **Duplicate prevention** - Unique constraint on email  
✅ **Timestamps** - Track when users signed up  
✅ **Serverless** - Neon scales automatically  
✅ **Free tier** - Generous limits for POC

---

## 🛠️ Troubleshooting

**Can't connect to database?**
- Verify `DATABASE_URL` in `.env.local`
- Check Vercel → Storage → Neon is connected
- Ensure table is created (run `schema.sql`)

**Duplicate key errors?**
- Table already has that email
- Check with: `SELECT * FROM waitlist WHERE email = 'user@example.com';`

**Environment variables not working?**
- Restart dev server: `npm run dev`
- Pull latest: `vercel env pull .env.local`

---

🎉 **Your waitlist is now production-ready!**
