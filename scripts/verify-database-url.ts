#!/usr/bin/env tsx
/**
 * Verify DATABASE_URL Configuration
 *
 * This script checks if your DATABASE_URL is properly configured
 * for Vercel serverless deployment with Supabase connection pooling.
 */

const databaseUrl = process.env.DATABASE_URL;

console.log("🔍 Verifying DATABASE_URL configuration...\n");

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL environment variable is not set!");
  console.error("\nPlease set DATABASE_URL in your environment.");
  process.exit(1);
}

// Mask the password for security
const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ":****@");
console.log("📋 Current DATABASE_URL (masked):");
console.log(`   ${maskedUrl}\n`);

// Check for connection pooling URL
const checks = {
  hasPooler: databaseUrl.includes("pooler.supabase.com"),
  hasPort6543: databaseUrl.includes(":6543/"),
  notDirectConnection:
    !databaseUrl.includes("db.") || databaseUrl.includes("pooler"),
  notPort5432: !databaseUrl.includes(":5432/"),
};

console.log("✅ Configuration Checks:");
console.log(
  `   ${checks.hasPooler ? "✓" : "✗"} Uses pooler.supabase.com (connection pooling)`
);
console.log(
  `   ${checks.hasPort6543 ? "✓" : "✗"} Uses port 6543 (pooling port)`
);
console.log(
  `   ${checks.notDirectConnection ? "✓" : "✗"} Not using direct connection (db.*.supabase.co)`
);
console.log(
  `   ${checks.notPort5432 ? "✓" : "✗"} Not using port 5432 (direct connection port)`
);

const allChecksPassed = Object.values(checks).every(Boolean);

console.log("\n" + "=".repeat(60));

if (allChecksPassed) {
  console.log("✅ SUCCESS: DATABASE_URL is correctly configured!");
  console.log("\nYour connection string uses Supabase connection pooling,");
  console.log("which is required for Vercel serverless deployments.");
  console.log("\n💡 Next steps:");
  console.log(
    "   1. Make sure this same URL is set in Vercel environment variables"
  );
  console.log("   2. Deploy your application");
  console.log("   3. Check Vercel function logs for any connection errors");
  process.exit(0);
} else {
  console.log("❌ FAILED: DATABASE_URL is NOT correctly configured!");
  console.log("\n⚠️  Issues detected:");

  if (!checks.hasPooler) {
    console.log("   • URL should contain 'pooler.supabase.com'");
  }
  if (!checks.hasPort6543) {
    console.log("   • URL should use port 6543 (not 5432)");
  }
  if (!checks.notDirectConnection) {
    console.log(
      "   • URL appears to be a direct connection (db.*.supabase.co)"
    );
  }
  if (!checks.notPort5432) {
    console.log("   • URL is using port 5432 (direct connection port)");
  }

  console.log("\n📖 How to fix:");
  console.log("   1. Go to Supabase Dashboard → Database Settings");
  console.log("   2. Find 'Connection Pooling' section");
  console.log("   3. Set Mode to 'Transaction'");
  console.log("   4. Copy the connection string (should have port 6543)");
  console.log("   5. Update your .env file and Vercel environment variables");
  console.log("\n✅ Correct format:");
  console.log(
    "   postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres"
  );
  console.log("\n❌ Incorrect format:");
  console.log(
    "   postgresql://postgres.PROJECT:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
  );

  console.log(
    "\n📚 See DATABASE_CONNECTION_TROUBLESHOOTING.md for detailed instructions"
  );
  process.exit(1);
}

// Made with Bob
