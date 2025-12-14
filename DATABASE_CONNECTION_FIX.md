# Database Connection Fix for Serverless Deployment

## Problem

The application was experiencing database connection errors in production (Vercel):

```
Error: Can't reach database server at db.rqrlmxwtbmxctcxikicv.supabase.co
PrismaClientKnownRequestError: Invalid `prisma.guestbook.findMany()` invocation
```

## Root Cause

The issue was caused by using `@prisma/adapter-pg` with a direct PostgreSQL connection (port 5432), which doesn't work reliably in serverless environments like Vercel. Serverless functions have:

- Short-lived execution contexts
- No persistent connections
- Connection pooling requirements
- Network restrictions for direct database connections

## Solution

### 1. Removed PostgreSQL Adapter

**Changed:** [`src/lib/prisma.ts`](src/lib/prisma.ts:1)

- Removed `@prisma/adapter-pg` dependency
- Removed `PrismaPg` adapter usage
- Simplified to use Prisma's native PostgreSQL driver
- Maintained singleton pattern for development
- Create fresh instances for production (serverless)

### 2. Updated Dependencies

**Changed:** [`package.json`](package.json:44)

- Removed `@prisma/adapter-pg` (no longer needed)
- Removed `pg` package (no longer needed)
- Kept `@prisma/client` for database operations

### 3. Updated Environment Configuration

**Changed:** [`.env.example`](.env.example:1)

- Added clear instructions to use Supabase's **Connection Pooling URL**
- Specified port 6543 (pooler) instead of 5432 (direct)
- Added example format and configuration details

### 4. Prisma Configuration

**Note:** In Prisma 7, the database URL is configured in [`prisma.config.ts`](prisma.config.ts:1), not in the schema file. The existing configuration already uses `env("DATABASE_URL")` correctly.

## Required Action in Vercel

You **MUST** update the `DATABASE_URL` environment variable in your Vercel project:

### Step 1: Get Connection Pooling URL from Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection pooling** section
4. Copy the **Connection string** with these settings:
   - **Mode:** Transaction
   - **Port:** 6543 (NOT 5432)

The URL format should look like:

```
postgresql://postgres.PROJECT_REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 2: Update Vercel Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find the `DATABASE_URL` variable
4. Click **Edit** and replace with the connection pooling URL from Step 1
5. Make sure it's enabled for **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 3: Redeploy

After updating the environment variable:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Select **Use existing Build Cache** (optional, faster)
5. Click **Redeploy**

## Why This Works

### Connection Pooling (Port 6543)

- Designed for serverless environments
- Manages connection lifecycle automatically
- Handles connection limits efficiently
- Works with short-lived serverless functions

### Direct Connection (Port 5432) - DON'T USE

- Requires persistent connections
- Doesn't work well with serverless cold starts
- Can exhaust connection limits
- Not optimized for serverless environments

### Prisma Native Driver

- Built-in support for connection pooling
- Optimized for serverless deployments
- No additional adapter dependencies
- Better error handling and retry logic

## Testing

After redeploying with the new `DATABASE_URL`:

1. Visit your production site
2. Test the guestbook page: `/guestbook`
3. Test the RSVP form: `/rsvp`
4. Test the game leaderboard: `/play`
5. Check Vercel logs for any remaining errors

All database operations should now work correctly without connection errors.

## Additional Notes

- The fix maintains backward compatibility with local development
- No changes needed to Prisma schema or migrations
- All existing data remains intact
- The singleton pattern prevents connection exhaustion in development

## Verification

To verify the fix is working:

```bash
# Check Vercel logs
vercel logs --follow

# Should see successful database queries without connection errors
```

## Rollback (If Needed)

If you need to rollback:

1. Revert the changes to `src/lib/prisma.ts`
2. Run `npm install @prisma/adapter-pg pg`
3. Redeploy to Vercel

However, this is **NOT recommended** as it will bring back the connection issues.
