import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import { isValidTokenFormat, isTokenExpired } from "../../lib/utils";

// Rate limiting map
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_REQUESTS = 10; // Max 10 verifications per minute per IP

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
 * GET /api/rsvp-verify-token?token=xxx
 * Verify a magic link token and return RSVP data if valid
 */
export const GET: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Get client identifier
    const identifier = clientAddress || "unknown";

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please wait a moment and try again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get token from query params
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Token parameter is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate token format
    if (!isValidTokenFormat(token)) {
      return new Response(
        JSON.stringify({
          error: "Invalid token format",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Look up token in database
    const tokenRecord = await prisma.rSVPModificationToken.findUnique({
      where: {
        token: token,
      },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        used: true,
        usedAt: true,
      },
    });

    if (!tokenRecord) {
      return new Response(
        JSON.stringify({
          error: "Invalid or expired token",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if token has been used
    if (tokenRecord.used) {
      return new Response(
        JSON.stringify({
          error: "This token has already been used",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if token has expired
    if (isTokenExpired(tokenRecord.expiresAt)) {
      return new Response(
        JSON.stringify({
          error: "This token has expired. Please request a new one.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Token is valid, fetch RSVP data
    const rsvp = await prisma.rSVP.findFirst({
      where: {
        guestEmail: tokenRecord.email,
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
          error: "RSVP not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return RSVP data
    return new Response(
      JSON.stringify({
        valid: true,
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
    console.error("Error in GET /api/rsvp-verify-token:", error);
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
