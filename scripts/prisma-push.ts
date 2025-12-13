import { execSync } from "child_process";

console.log("🗄️  Creating database tables with Prisma...\n");

try {
  console.log(
    "📋 Note: You need to update DATABASE_URL in .env with your Supabase database password"
  );
  console.log(
    "   Format: postgresql://postgres:[YOUR-PASSWORD]@db.rqrlmxwtbmxctcxikicv.supabase.co:5432/postgres\n"
  );
  console.log(
    "   Get your password from: Supabase Dashboard → Settings → Database → Connection String\n"
  );

  console.log("🚀 Pushing schema to database...\n");

  execSync("npx prisma db push", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("\n✅ Database tables created successfully!\n");
  console.log("Tables created:");
  console.log("  ✓ rsvps");
  console.log("  ✓ guestbook");
  console.log("  ✓ visitor_count\n");

  console.log("🎉 You can now run: npm run dev\n");
} catch (error) {
  console.error("\n❌ Error creating tables:", error);
  console.log("\nMake sure:");
  console.log("  1. DATABASE_URL is set correctly in .env");
  console.log("  2. Your Supabase database password is correct");
  console.log("  3. Your database is accessible\n");
  process.exit(1);
}

// Made with Bob
