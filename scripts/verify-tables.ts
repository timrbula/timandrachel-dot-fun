import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTables() {
  console.log("🔍 Verifying database tables...\n");

  try {
    // Check RSVP table
    const { count: rsvpCount, error: rsvpError } = await supabase
      .from("rsvps")
      .select("*", { count: "exact", head: true });

    if (rsvpError) throw new Error(`rsvps table error: ${rsvpError.message}`);
    console.log("✅ rsvps table exists (count:", rsvpCount || 0, ")");

    // Check Guestbook table
    const { count: guestbookCount, error: guestbookError } = await supabase
      .from("guestbook")
      .select("*", { count: "exact", head: true });

    if (guestbookError)
      throw new Error(`guestbook table error: ${guestbookError.message}`);
    console.log("✅ guestbook table exists (count:", guestbookCount || 0, ")");

    // Check VisitorCount table and initialize if needed
    const { data: visitorCount, error: visitorError } = await supabase
      .from("visitor_count")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (visitorError)
      throw new Error(`visitor_count table error: ${visitorError.message}`);

    if (!visitorCount) {
      // Initialize visitor count
      const { error: insertError } = await supabase
        .from("visitor_count")
        .insert({ id: 1, count: 0 });

      if (insertError)
        throw new Error(
          `Failed to initialize visitor_count: ${insertError.message}`
        );
      console.log("✅ visitor_count table exists and initialized (count: 0 )");
    } else {
      console.log(
        "✅ visitor_count table exists (count:",
        visitorCount.count || 0,
        ")"
      );
    }

    console.log("\n🎉 All tables verified successfully!");
    console.log("\nYour database is ready to use!");
    console.log("You can now run: npm run dev\n");
  } catch (error) {
    console.error("❌ Error verifying tables:", error);
    process.exit(1);
  }
}

verifyTables();

// Made with Bob
