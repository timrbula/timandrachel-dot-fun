-- Allow NULL values for email column in guests table
-- This ensures the database schema matches the Prisma schema where email is optional

ALTER TABLE guests ALTER COLUMN email DROP NOT NULL;

-- Made with Bob