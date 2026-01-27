-- Nash Point Waitlist Table Schema
-- Run this in Neon SQL Editor to create the waitlist table

CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- If you already have the table, run this to add the name column:
-- ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS name VARCHAR(255);
-- UPDATE waitlist SET name = '' WHERE name IS NULL;
-- ALTER TABLE waitlist ALTER COLUMN name SET NOT NULL;

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
