/**
 * Database Connection Test Script
 *
 * This script tests the Supabase database connection and verifies
 * that all tables and functions are working correctly.
 */

// Load environment variables from .env file BEFORE any imports
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env");
try {
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim();
      }
    }
  });
  console.log("✓ Loaded environment variables from .env");
} catch (error) {
  console.error("✗ Could not load .env file:", error);
  process.exit(1);
}

// Now import after env vars are loaded
const {
  prisma,
  getVisitorCount,
  incrementVisitorCount,
  getGuestbookEntries,
  getAllRSVPs,
} = await import("../src/lib/supabase.js");

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  error?: any;
}

const results: TestResult[] = [];

/**
 * Test database connection
 */
async function testConnection(): Promise<TestResult> {
  try {
    // Test connection by querying the visitor_count table
    await prisma.visitorCount.findUnique({
      where: { id: 1 },
    });

    return {
      name: "Database Connection",
      passed: true,
      message: "Successfully connected to database via Prisma",
    };
  } catch (error) {
    return {
      name: "Database Connection",
      passed: false,
      message: "Connection error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test visitor_count table
 */
async function testVisitorCount(): Promise<TestResult> {
  try {
    const count = await getVisitorCount();

    if (typeof count !== "number") {
      return {
        name: "Visitor Count Table",
        passed: false,
        message: "Invalid count returned",
      };
    }

    return {
      name: "Visitor Count Table",
      passed: true,
      message: `Current visitor count: ${count}`,
    };
  } catch (error) {
    return {
      name: "Visitor Count Table",
      passed: false,
      message: "Failed to read visitor count",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test increment function
 */
async function testIncrementFunction(): Promise<TestResult> {
  try {
    const newCount = await incrementVisitorCount();

    if (typeof newCount !== "number" || newCount <= 0) {
      return {
        name: "Increment Function",
        passed: false,
        message: "Invalid count returned from increment",
      };
    }

    return {
      name: "Increment Function",
      passed: true,
      message: `Successfully incremented to: ${newCount}`,
    };
  } catch (error) {
    return {
      name: "Increment Function",
      passed: false,
      message: "Failed to increment visitor count",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test guestbook table
 */
async function testGuestbookTable(): Promise<TestResult> {
  try {
    const entries = await getGuestbookEntries(1, 1);

    return {
      name: "Guestbook Table",
      passed: true,
      message: `Guestbook table accessible (${entries.length} entries fetched)`,
    };
  } catch (error) {
    return {
      name: "Guestbook Table",
      passed: false,
      message: "Error accessing guestbook table",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test RSVPs table
 */
async function testRSVPsTable(): Promise<TestResult> {
  try {
    const rsvps = await getAllRSVPs();

    return {
      name: "RSVPs Table",
      passed: true,
      message: `RSVPs table accessible (${rsvps.length} entries)`,
    };
  } catch (error) {
    return {
      name: "RSVPs Table",
      passed: false,
      message: "Error accessing RSVPs table",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("🧪 Testing Database Connection...\n");
  console.log("=".repeat(50));
  console.log("");

  // Run tests
  results.push(await testConnection());
  results.push(await testVisitorCount());
  results.push(await testIncrementFunction());
  results.push(await testGuestbookTable());
  results.push(await testRSVPsTable());

  // Display results
  console.log("Test Results:");
  console.log("-".repeat(50));

  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log("");
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log("=".repeat(50));
  console.log(`Summary: ${passed}/${total} tests passed`);
  console.log("");

  if (passed === total) {
    console.log("🎉 All tests passed! Database is ready to use.");
    process.exit(0);
  } else {
    console.log("⚠️  Some tests failed. Please check your database setup.");
    console.log("");
    console.log("Troubleshooting:");
    console.log("1. Verify your .env file has correct DATABASE_URL");
    console.log("2. Ensure you ran: npm run db:push or npm run db:migrate");
    console.log("3. Check that your database is accessible");
    console.log("4. Review README.md for detailed setup instructions");
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});

// Made with Bob
