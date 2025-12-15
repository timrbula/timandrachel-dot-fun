import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import { isValidEmail } from "../../lib/utils";

// Rate limiting map
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // Max 10 lookups per minute per IP

/**
 * Check rate limit
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(identifier);

  if (!lastRequest || now - lastRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, now);
    return true;
  }

  return false;
}

/**
 * GET /api/rsvp-lookup?email=user@example.com
 * Lookup an existing RSVP by email address
 */
export const GET: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Get client identifier
    const identifier = clientAddress || "unknown";

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({
          error:
            "Too many lookup requests. Please wait a moment and try again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get email from query params
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Email parameter is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({
          error: "Please provide a valid email address",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Look up RSVP
    const rsvp = await prisma.rSVP.findFirst({
      where: {
        guestEmail: email.trim().toLowerCase(),
      },
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        attending: true,
        plusOne: true,
        plusOneName: true,
        dietaryRestrictions: true,
        songRequests: true,
        specialAccommodations: true,
        numberOfGuests: true,
        createdAt: true,
      },
    });

    if (!rsvp) {
      return new Response(
        JSON.stringify({
          found: false,
          message: "No RSVP found with this email address",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return RSVP data
    return new Response(
      JSON.stringify({
        found: true,
        rsvp: {
          id: rsvp.id,
          guest_name: rsvp.guestName,
          guest_email: rsvp.guestEmail,
          attending: rsvp.attending,
          plus_one: rsvp.plusOne,
          plus_one_name: rsvp.plusOneName,
          dietary_restrictions: rsvp.dietaryRestrictions,
          song_requests: rsvp.songRequests,
          special_accommodations: rsvp.specialAccommodations,
          number_of_guests: rsvp.numberOfGuests,
          created_at: rsvp.createdAt,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/rsvp-lookup:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

// Made with Bob
