import type { APIRoute } from "astro";
import { prisma } from "../../lib/supabase";

/**
 * GET /api/guest-search?q=email_or_name
 * Public endpoint to search for a guest by email or name
 * Returns guest info if found (for RSVP form lookup)
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const query = url.searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Search query must be at least 2 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const searchTerm = query.trim().toLowerCase();

    // Search for guest by email or name
    const guest = await prisma.guest.findFirst({
      where: {
        OR: [
          { email: { equals: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        allowPlusOne: true,
        maxGuests: true,
        rsvps: {
          select: {
            id: true,
            attending: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!guest) {
      return new Response(
        JSON.stringify({ found: false, message: "No invitation found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if they already RSVP'd
    const hasRSVPd = guest.rsvps.length > 0;

    return new Response(
      JSON.stringify({
        found: true,
        guest: {
          id: guest.id,
          name: guest.name,
          email: guest.email,
          allowPlusOne: guest.allowPlusOne,
          maxGuests: guest.maxGuests,
          hasRSVPd,
          rsvpStatus: hasRSVPd
            ? guest.rsvps[0].attending
              ? "attending"
              : "declined"
            : null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in GET /api/guest-search:", error);
    return new Response(
      JSON.stringify({ error: "Failed to search for guest" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Made with Bob
