-- Add phone number and SMS consent columns to rsvps table
-- Captures opt-in consent at the point of collection (required for A2P 10DLC compliance)
ALTER TABLE rsvps
ADD COLUMN phone TEXT,
ADD COLUMN sms_consent BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN rsvps.phone IS 'Guest phone number provided at RSVP time (E.164 or US format)';
COMMENT ON COLUMN rsvps.sms_consent IS 'Whether the guest opted in to receive SMS text updates';

-- Made with Bob
