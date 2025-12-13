import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function createTables() {
  console.log("🗄️  Creating database tables...\n");

  try {
    // Read the migration file
    const migrationPath = join(
      process.cwd(),
      "supabase/migrations/001_initial_schema.sql"
    );
    // Migration SQL is read but not used directly due to API limitations
    // const migrationSQL = readFileSync(migrationPath, "utf-8");
    readFileSync(migrationPath, "utf-8"); // Verify file exists

    console.log("📄 Executing migration: 001_initial_schema.sql\n");

    // Extract project reference from URL
    const projectRef = supabaseUrl.match(
      /https:\/\/([^.]+)\.supabase\.co/
    )?.[1];

    if (!projectRef) {
      throw new Error("Could not extract project reference from URL");
    }

    // Note: Supabase Management API URL (not used due to auth requirements)
    // const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

    console.log(
      "⚠️  Direct SQL execution via API requires additional authentication."
    );
    console.log("Using manual setup approach instead...\n");

    // Since we can't execute raw SQL directly, let's verify if tables exist
    console.log("🔍 Checking if tables already exist...\n");

    const { error: rsvpsError } = await supabase
      .from("rsvps")
      .select("count", { count: "exact", head: true });

    const { error: guestbookError } = await supabase
      .from("guestbook")
      .select("count", { count: "exact", head: true });

    const { error: visitorError } = await supabase
      .from("visitor_count")
      .select("count", { count: "exact", head: true });

    if (!rsvpsError && !guestbookError && !visitorError) {
      console.log("✅ All tables already exist!");
      console.log("✓ rsvps table");
      console.log("✓ guestbook table");
      console.log("✓ visitor_count table\n");
      console.log("Database is ready to use! 🚀\n");
      return;
    }

    // Tables don't exist, provide manual instructions
    console.log("📋 Tables need to be created. Please follow these steps:\n");
    console.log("1. Open your Supabase SQL Editor:");
    console.log(
      `   ${supabaseUrl.replace("https://", "https://app.supabase.com/project/")}/sql/new\n`
    );
    console.log("2. Copy the entire contents of this file:");
    console.log("   supabase/migrations/001_initial_schema.sql\n");
    console.log("3. Paste it into the SQL Editor\n");
    console.log("4. Click 'Run' (or press Cmd/Ctrl + Enter)\n");
    console.log("5. Verify the tables were created in the Table Editor\n");
    console.log("Then run this script again to verify the setup.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("\n📋 Manual Setup Required:");
    console.log(
      `1. Go to: ${supabaseUrl.replace("https://", "https://app.supabase.com/project/")}/sql/new`
    );
    console.log(
      "2. Copy the contents of: supabase/migrations/001_initial_schema.sql"
    );
    console.log("3. Paste into the SQL Editor");
    console.log("4. Click 'Run' to execute\n");
    process.exit(1);
  }
}

createTables();

// Made with Bob
