-- Add plus_one_dietary_restrictions column to rsvps table
ALTER TABLE rsvps 
ADD COLUMN plus_one_dietary_restrictions TEXT;

-- Add comment for documentation
COMMENT ON COLUMN rsvps.plus_one_dietary_restrictions IS 'Dietary restrictions or allergies for the plus-one guest';

-- Made with Bob
