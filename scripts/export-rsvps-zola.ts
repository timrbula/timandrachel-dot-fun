/**
 * Export RSVPs to Zola Guest Upload CSV format
 *
 * Outputs all attending RSVPs formatted for Zola's guest upload template.
 * Run with: npx tsx scripts/export-rsvps-zola.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Load .env before any imports
const envPath = resolve(process.cwd(), ".env");
try {
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const raw = valueParts.join("=").trim();
        process.env[key.trim()] = raw.replace(/^["']|["']$/g, "");
      }
    }
  });
} catch (error) {
  console.error("✗ Could not load .env file:", error);
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const rsvps = await prisma.rSVP.findMany({
  where: { attending: true },
  orderBy: { createdAt: "asc" },
});

function escapeCsv(value: string | null | undefined): string {
  const str = value ?? "";
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const header = [
  "Name",
  "Plus One",
  "Email Address",
  "Phone Number",
  "Street Address 1",
  "Street Address 2",
  "City",
  "State/Region",
  "Postal Code",
  "Additional Guest 1",
  "Additional Guest 2",
].join(",");

const rows = rsvps.map((rsvp) => {
  const plusOne = rsvp.plusOne
    ? escapeCsv(rsvp.plusOneName || "Yes")
    : "";
  return [
    escapeCsv(rsvp.guestName),
    plusOne,
    escapeCsv(rsvp.guestEmail),
    "", // Phone Number — not collected
    "", // Street Address 1 — not collected
    "", // Street Address 2 — not collected
    "", // City — not collected
    "", // State/Region — not collected
    "", // Postal Code — not collected
    "", // Additional Guest 1 — not collected
    "", // Additional Guest 2 — not collected
  ].join(",");
});

const csv = [header, ...rows].join("\n");
const outPath = resolve(process.cwd(), "rsvps-zola.csv");
writeFileSync(outPath, csv, "utf-8");

console.log(`✓ Exported ${rsvps.length} attending RSVPs to rsvps-zola.csv`);

await prisma.$disconnect();
