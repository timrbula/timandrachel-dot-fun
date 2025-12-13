import prisma from "./prisma";
import type {
  RSVP as PrismaRSVP,
  Guestbook as PrismaGuestbook,
  VisitorCount as PrismaVisitorCount,
} from "@prisma/client";

// Database Types (matching Prisma schema)
export interface RSVP {
  id: string;
  created_at: string;
  guest_name: string;
  guest_email: string;
  attending: boolean;
  plus_one: boolean;
  plus_one_name?: string | null;
  dietary_restrictions?: string | null;
  song_requests?: string | null;
  special_accommodations?: string | null;
  number_of_guests: number;
}

export interface GuestbookEntry {
  id: string;
  created_at: string;
  name: string;
  message: string;
  location?: string | null;
}

export interface VisitorCount {
  id: number;
  count: number;
  last_updated: string;
}

// Helper function to convert Prisma RSVP to API format
function formatRSVP(rsvp: PrismaRSVP): RSVP {
  return {
    id: rsvp.id,
    created_at: rsvp.createdAt.toISOString(),
    guest_name: rsvp.guestName,
    guest_email: rsvp.guestEmail,
    attending: rsvp.attending,
    plus_one: rsvp.plusOne,
    plus_one_name: rsvp.plusOneName,
    dietary_restrictions: rsvp.dietaryRestrictions,
    song_requests: rsvp.songRequests,
    special_accommodations: rsvp.specialAccommodations,
    number_of_guests: rsvp.numberOfGuests,
  };
}

// Helper function to convert Prisma Guestbook to API format
function formatGuestbookEntry(entry: PrismaGuestbook): GuestbookEntry {
  return {
    id: entry.id,
    created_at: entry.createdAt.toISOString(),
    name: entry.name,
    message: entry.message,
    location: entry.location,
  };
}

// Helper function to convert Prisma VisitorCount to API format
function formatVisitorCount(count: PrismaVisitorCount): VisitorCount {
  return {
    id: count.id,
    count: count.count,
    last_updated: count.lastUpdated.toISOString(),
  };
}

/**
 * Submit RSVP
 */
export async function submitRSVP(
  data: Omit<RSVP, "id" | "created_at">
): Promise<RSVP> {
  try {
    const rsvp = await prisma.rSVP.create({
      data: {
        guestName: data.guest_name,
        guestEmail: data.guest_email,
        attending: data.attending,
        plusOne: data.plus_one,
        plusOneName: data.plus_one_name,
        dietaryRestrictions: data.dietary_restrictions,
        songRequests: data.song_requests,
        specialAccommodations: data.special_accommodations,
        numberOfGuests: data.number_of_guests,
      },
    });

    return formatRSVP(rsvp);
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    throw error;
  }
}

/**
 * Get all RSVPs (admin only)
 */
export async function getAllRSVPs(): Promise<RSVP[]> {
  try {
    const rsvps = await prisma.rSVP.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return rsvps.map(formatRSVP);
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    throw error;
  }
}

/**
 * Submit guestbook entry
 */
export async function submitGuestbookEntry(
  name: string,
  message: string,
  location?: string
): Promise<GuestbookEntry> {
  try {
    const entry = await prisma.guestbook.create({
      data: {
        name,
        message,
        location,
      },
    });

    return formatGuestbookEntry(entry);
  } catch (error) {
    console.error("Error submitting guestbook entry:", error);
    throw error;
  }
}

/**
 * Get guestbook entries (paginated)
 */
export async function getGuestbookEntries(
  page: number = 1,
  limit: number = 10
): Promise<GuestbookEntry[]> {
  try {
    const skip = (page - 1) * limit;

    const entries = await prisma.guestbook.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return entries.map(formatGuestbookEntry);
  } catch (error) {
    console.error("Error fetching guestbook entries:", error);
    throw error;
  }
}

/**
 * Increment visitor count
 */
export async function incrementVisitorCount(): Promise<number> {
  try {
    // Use upsert to create or update the visitor count
    const result = await prisma.visitorCount.upsert({
      where: { id: 1 },
      update: {
        count: {
          increment: 1,
        },
        lastUpdated: new Date(),
      },
      create: {
        id: 1,
        count: 1,
        lastUpdated: new Date(),
      },
    });

    return result.count;
  } catch (error) {
    console.error("Error incrementing visitor count:", error);
    return 0;
  }
}

/**
 * Get current visitor count
 */
export async function getVisitorCount(): Promise<number> {
  try {
    const result = await prisma.visitorCount.findUnique({
      where: { id: 1 },
    });

    return result?.count || 0;
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    return 0;
  }
}

// Export prisma client for direct access if needed
export { prisma };

// Made with Bob
