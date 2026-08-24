-- Add phone number column to guests table
-- Used to send SMS/text updates to attending guests
ALTER TABLE guests
ADD COLUMN phone TEXT;

COMMENT ON COLUMN guests.phone IS 'Guest phone number (E.164 or US format) used for SMS notifications';

-- Made with Bob
