/**
 * Backup all RSVP data to a timestamped CSV file
 *
 * Unlike scripts/export-rsvps-zola.ts (which only exports attending guests
 * in the Zola guest-upload format), this dumps every RSVP row and every
 * column verbatim — intended as a full backup before running schema
 * migrations or other risky database changes.
 *
 * Run with: npx tsx scripts/backup-rsvps.ts
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
  orderBy: { createdAt: "asc" },
});

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const columns = [
  "id",
  "createdAt",
  "guestId",
  "guestName",
  "guestEmail",
  "attending",
  "welcomeParty",
  "picnic",
  "plusOne",
  "plusOneName",
  "dietaryRestrictions",
  "plusOneDietaryRestrictions",
  "songRequests",
  "specialAccommodations",
  "numberOfGuests",
] as const;

const header = columns.join(",");

const rows = rsvps.map((rsvp) =>
  columns.map((col) => escapeCsv((rsvp as Record<string, unknown>)[col])).join(",")
);

const csv = [header, ...rows].join("\n");

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outPath = resolve(process.cwd(), `rsvps-backup-${timestamp}.csv`);
writeFileSync(outPath, csv, "utf-8");

console.log(`✓ Backed up ${rsvps.length} RSVPs (all fields, all rows) to ${outPath}`);

await prisma.$disconnect();
