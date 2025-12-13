-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- RSVPs Table
CREATE TABLE rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    attending BOOLEAN NOT NULL,
    plus_one BOOLEAN DEFAULT FALSE,
    plus_one_name TEXT,
    dietary_restrictions TEXT,
    song_requests TEXT,
    special_accommodations TEXT,
    number_of_guests INTEGER DEFAULT 1 CHECK (number_of_guests > 0 AND number_of_guests <= 10)
);

-- Guestbook Table
CREATE TABLE guestbook (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    location TEXT
);

-- Visitor Counter Table
CREATE TABLE visitor_count (
    id INTEGER PRIMARY KEY DEFAULT 1,
    count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial visitor count
INSERT INTO visitor_count (id, count) VALUES (1, 0);

-- Create indexes for better query performance
CREATE INDEX idx_rsvps_email ON rsvps(guest_email);
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at DESC);
CREATE INDEX idx_guestbook_created_at ON guestbook(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_count ENABLE ROW LEVEL SECURITY;

-- RSVPs: Anyone can insert, only service role can read all
CREATE POLICY "Anyone can submit RSVP" ON rsvps
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can read RSVPs" ON rsvps
    FOR SELECT
    USING (auth.role() = 'service_role');

-- Guestbook: Anyone can read and insert
CREATE POLICY "Anyone can read guestbook" ON guestbook
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can sign guestbook" ON guestbook
    FOR INSERT
    WITH CHECK (true);

-- Visitor Count: Anyone can read, only service role can update
CREATE POLICY "Anyone can read visitor count" ON visitor_count
    FOR SELECT
    USING (true);

CREATE POLICY "Service role can update visitor count" ON visitor_count
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Function to increment visitor count
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE visitor_count
    SET count = count + 1,
        last_updated = NOW()
    WHERE id = 1
    RETURNING count INTO new_count;

    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO anon, authenticated;

-- Made with Bob
