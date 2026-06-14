-- Add welcome_party and picnic attendance columns to rsvps table
-- Values: 'yes', 'no', 'not_sure'
ALTER TABLE rsvps 
ADD COLUMN welcome_party TEXT DEFAULT 'not_sure';

ALTER TABLE rsvps 
ADD COLUMN picnic TEXT DEFAULT 'not_sure';

-- Add comments for documentation
COMMENT ON COLUMN rsvps.welcome_party IS 'Whether the guest is attending the welcome party: yes, no, or not_sure';
COMMENT ON COLUMN rsvps.picnic IS 'Whether the guest is attending the post-wedding picnic: yes, no, or not_sure';

-- Made with Bob
