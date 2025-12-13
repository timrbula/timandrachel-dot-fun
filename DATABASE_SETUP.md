# 🗄️ Database Setup Guide

## Supabase Initial Migration

Create this file as `supabase/migrations/001_initial_schema.sql`:

```sql
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
```

## Environment Variables Setup

Create `.env` file (DO NOT COMMIT):

```env
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Resend
RESEND_API_KEY=re_your-api-key

# Admin
ADMIN_EMAIL=your-email@example.com

# Optional
PUBLIC_SITE_URL=https://your-site.vercel.app
```

Create `.env.example` file (SAFE TO COMMIT):

```env
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Resend
RESEND_API_KEY=re_your-api-key-here

# Admin
ADMIN_EMAIL=admin@example.com

# Optional
PUBLIC_SITE_URL=https://your-site.vercel.app
```

## Supabase Setup Steps

1. **Create Supabase Project**

   - Go to https://supabase.com
   - Create new project
   - Note your project URL and keys

2. **Run Migration**

   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the migration SQL
   - Execute the script

3. **Verify Tables**

   - Check Table Editor
   - Confirm `rsvps`, `guestbook`, and `visitor_count` exist
   - Verify RLS policies are enabled

4. **Test Connection**
   - Use Supabase client to test queries
   - Verify anon key can insert but not read RSVPs
   - Verify service key has full access

## Sample Data for Testing

```sql
-- Sample RSVP
INSERT INTO rsvps (guest_name, guest_email, attending, plus_one, plus_one_name, dietary_restrictions, song_requests, number_of_guests)
VALUES ('John Doe', 'john@example.com', true, true, 'Jane Doe', 'Vegetarian', 'Dancing Queen by ABBA', 2);

-- Sample Guestbook Entry
INSERT INTO guestbook (name, message, location)
VALUES ('Alice Smith', 'Congratulations! So excited for you both! 💕', 'Brooklyn, NY');

-- Check visitor count
SELECT * FROM visitor_count;
```

## Resend Setup Steps

1. **Create Resend Account**

   - Go to https://resend.com
   - Sign up for account
   - Verify your domain (optional but recommended)

2. **Get API Key**

   - Go to API Keys section
   - Create new API key
   - Copy key to `.env` file

3. **Email Templates**

**RSVP Confirmation Email (to guest):**

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: "Comic Sans MS", cursive;
        background: #ff00ff;
        color: #ffff00;
      }
      .container {
        background: #00ffff;
        padding: 20px;
        border: 5px solid #ff0000;
      }
      h1 {
        color: #ff0000;
        text-shadow: 2px 2px #0000ff;
      }
      .blink {
        animation: blink 1s infinite;
      }
      @keyframes blink {
        50% {
          opacity: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🎉 RSVP CONFIRMED! 🎉</h1>
      <p class="blink">*** THANK YOU FOR YOUR RESPONSE! ***</p>
      <p>Dear {{guest_name}},</p>
      <p>
        We received your RSVP! We're so excited to celebrate with you in NYC!
      </p>
      <p><strong>Your Details:</strong></p>
      <ul>
        <li>Attending: {{attending}}</li>
        <li>Number of Guests: {{number_of_guests}}</li>
        {{#if plus_one_name}}
        <li>Plus One: {{plus_one_name}}</li>
        {{/if}}
      </ul>
      <p>See you soon! 💒🗽</p>
      <p>
        <img
          src="https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif"
          alt="Celebration"
        />
      </p>
    </div>
  </body>
</html>
```

**Admin Notification Email:**

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      .container {
        padding: 20px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #4caf50;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>New RSVP Received</h2>
      <table>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Name</td>
          <td>{{guest_name}}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td>{{guest_email}}</td>
        </tr>
        <tr>
          <td>Attending</td>
          <td>{{attending}}</td>
        </tr>
        <tr>
          <td>Number of Guests</td>
          <td>{{number_of_guests}}</td>
        </tr>
        <tr>
          <td>Plus One</td>
          <td>{{plus_one_name}}</td>
        </tr>
        <tr>
          <td>Dietary Restrictions</td>
          <td>{{dietary_restrictions}}</td>
        </tr>
        <tr>
          <td>Song Requests</td>
          <td>{{song_requests}}</td>
        </tr>
        <tr>
          <td>Special Accommodations</td>
          <td>{{special_accommodations}}</td>
        </tr>
        <tr>
          <td>Submitted</td>
          <td>{{created_at}}</td>
        </tr>
      </table>
    </div>
  </body>
</html>
```

## Vercel Environment Variables

Add these in Vercel dashboard under Settings > Environment Variables:

```
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
RESEND_API_KEY
ADMIN_EMAIL
PUBLIC_SITE_URL
```

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key kept secret (never in client code)
- [ ] Anon key only used for public operations
- [ ] Email validation on all forms
- [ ] Rate limiting on API routes
- [ ] Input sanitization for all user data
- [ ] CORS configured for production domain
- [ ] Environment variables set in Vercel
- [ ] `.env` file in `.gitignore`

## Backup Strategy

1. **Automated Backups**: Supabase provides daily backups
2. **Manual Export**: Use Supabase dashboard to export data
3. **Migration History**: Keep all migration files in version control

## Monitoring

1. **Supabase Dashboard**: Monitor database usage
2. **Vercel Analytics**: Track site performance
3. **Resend Dashboard**: Monitor email delivery
4. **Error Logging**: Implement error tracking (optional: Sentry)

---

Database setup complete! Ready to build! 🚀
