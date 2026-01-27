# 🎯 ACTION REQUIRED: Create Database Table

## ⚠️ Important - Do This Now!

Your Neon Postgres integration is set up, but you need to create the database table.

### Step 1: Open Neon SQL Editor

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `nashpoint-poker`
3. Go to **Storage** tab
4. Click on your Neon database
5. Click **"Open in Neon Console"**
6. Navigate to **SQL Editor**

### Step 2: Run This SQL

Copy and paste this into the SQL Editor and click **Run**:

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

### Step 3: Verify It Worked

Run this query to confirm:

```sql
SELECT * FROM waitlist;
```

You should see:
- An empty table with columns: `id`, `email`, `notes`, `created_at`

### Step 4: Test Your Waitlist

1. Run `npm run dev` locally
2. Go to http://localhost:3000/early-access
3. Submit a test email
4. Check the database: `SELECT * FROM waitlist;`

---

## ✅ Once Complete

You'll have a production-ready waitlist that:
- ✅ Stores data permanently in Neon Postgres
- ✅ Prevents duplicate email signups
- ✅ Tracks signup timestamps
- ✅ Works in both local dev and Vercel production

---

**After creating the table, commit and push your changes to deploy!**

```bash
git add .
git commit -m "Add Neon Postgres database integration for waitlist"
git push
```
