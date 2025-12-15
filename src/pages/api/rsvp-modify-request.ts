import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import {
  isValidEmail,
  generateSecureToken,
  getTokenExpiration,
} from "../../lib/utils";
import { sendMagicLinkEmail } from "../../lib/resend";

// Rate limiting map
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute

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
 * POST /api/rsvp-modify-request
 * Request a magic link to modify an existing RSVP
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Get client identifier
    const identifier = clientAddress || "unknown";

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please wait a few minutes and try again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate email
    if (!body.email || typeof body.email !== "string") {
      return new Response(
        JSON.stringify({
          error: "Email address is required",
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
    if (!isValidEmail(body.email)) {
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

    const email = body.email.trim().toLowerCase();

    // Check if RSVP exists
    const existingRSVP = await prisma.rSVP.findFirst({
      where: {
        guestEmail: email,
      },
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
      },
    });

    if (!existingRSVP) {
      return new Response(
        JSON.stringify({
          error:
            "No RSVP found with this email address. Please submit a new RSVP instead.",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = getTokenExpiration();

    // Get user agent for tracking
    const userAgent = request.headers.get("user-agent") || undefined;

    // Store token in database
    await prisma.rSVPModificationToken.create({
      data: {
        email: email,
        token: token,
        expiresAt: expiresAt,
        ipAddress: identifier,
        userAgent: userAgent,
      },
    });

    // Send magic link email
    try {
      await sendMagicLinkEmail(
        existingRSVP.guestEmail,
        existingRSVP.guestName,
        token
      );
    } catch (emailError) {
      console.error("Error sending magic link email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    // Return success response (don't reveal if email was sent)
    return new Response(
      JSON.stringify({
        success: true,
        message:
          "If an RSVP exists with this email, you will receive a link to edit it shortly.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in POST /api/rsvp-modify-request:", error);
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
