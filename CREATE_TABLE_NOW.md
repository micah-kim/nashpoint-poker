# Create The Waitlist Table

If the waitlist form is failing because the database table does not exist yet, run this SQL in Neon:

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

Verify the table:

```sql
SELECT * FROM waitlist;
```

You should see the columns:

- `id`
- `name`
- `email`
- `notes`
- `created_at`

Then test locally at `http://localhost:3000/early-access`.
