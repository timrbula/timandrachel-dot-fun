-- Step 1: Drop the existing unique constraint on email
ALTER TABLE guests DROP CONSTRAINT IF EXISTS guests_email_key;

-- Step 2: Drop the existing index on email (from the schema)
DROP INDEX IF EXISTS idx_guests_email;

-- Step 3: Create a partial unique index that only applies to non-null, non-empty emails
CREATE UNIQUE INDEX IF NOT EXISTS guests_email_unique_partial 
ON guests (email) 
WHERE email IS NOT NULL AND email != '';

-- Step 4: Recreate the regular index for search performance (non-unique)
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests (email);

-- Made with Bob
