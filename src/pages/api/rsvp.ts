import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import {
  sanitizeInput,
  isValidEmail,
  isValidTokenFormat,
  isTokenExpired,
} from "../../lib/utils";
import {
  sendRSVPConfirmation,
  sendAdminRSVPNotification,
} from "../../lib/resend";

// Rate limiting map
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 300000; // 5 minutes
// const MAX_REQUESTS = 3; // Max 3 RSVP submissions per 5 minutes per IP (currently unused)

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
 * POST /api/rsvp
 * Handle RSVP form submission
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Get client identifier
    const identifier = clientAddress || "unknown";

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({
          error:
            "Too many RSVP submissions. Please wait a few minutes and try again.",
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

    // Validate required fields
    if (!body.guest_name || typeof body.guest_name !== "string") {
      return new Response(
        JSON.stringify({
          error: "Guest name is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!body.guest_email || typeof body.guest_email !== "string") {
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

    if (typeof body.attending !== "boolean") {
      return new Response(
        JSON.stringify({
          error: "Please indicate if you will be attending",
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
    if (!isValidEmail(body.guest_email)) {
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

    // Validate plus one
    if (body.plus_one && !body.plus_one_name) {
      return new Response(
        JSON.stringify({
          error: "Please provide your plus-one's name",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      guest_name: sanitizeInput(body.guest_name.trim()),
      guest_email: body.guest_email.trim().toLowerCase(),
      attending: body.attending,
      plus_one: body.plus_one || false,
      plus_one_name: body.plus_one_name
        ? sanitizeInput(body.plus_one_name.trim())
        : null,
      dietary_restrictions: body.dietary_restrictions
        ? sanitizeInput(body.dietary_restrictions.trim())
        : null,
      song_requests: body.song_requests
        ? sanitizeInput(body.song_requests.trim())
        : null,
      special_accommodations: body.special_accommodations
        ? sanitizeInput(body.special_accommodations.trim())
        : null,
      number_of_guests: body.number_of_guests || 1,
    };

    // Check for duplicate submission (same email)
    const existingRSVP = await prisma.rSVP.findFirst({
      where: {
        guestEmail: sanitizedData.guest_email,
      },
      select: {
        id: true,
      },
    });

    if (existingRSVP) {
      return new Response(
        JSON.stringify({
          error:
            "An RSVP with this email already exists. Please contact us if you need to update your response.",
        }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Try to find matching guest in the guest list
    let guestId: string | null = null;
    try {
      const matchingGuest = await prisma.guest.findFirst({
        where: {
          email: sanitizedData.guest_email,
        },
        select: {
          id: true,
        },
      });
      if (matchingGuest) {
        guestId = matchingGuest.id;
      }
    } catch (error) {
      console.log("Guest lookup failed, continuing without link:", error);
    }

    // Insert RSVP into database
    const rsvp = await prisma.rSVP.create({
      data: {
        guestId: guestId,
        guestName: sanitizedData.guest_name,
        guestEmail: sanitizedData.guest_email,
        attending: sanitizedData.attending,
        plusOne: sanitizedData.plus_one,
        plusOneName: sanitizedData.plus_one_name,
        dietaryRestrictions: sanitizedData.dietary_restrictions,
        songRequests: sanitizedData.song_requests,
        specialAccommodations: sanitizedData.special_accommodations,
        numberOfGuests: sanitizedData.number_of_guests,
      },
    });

    // Send confirmation email to guest
    try {
      await sendRSVPConfirmation(
        sanitizedData.guest_email,
        sanitizedData.guest_name,
        sanitizedData.attending,
        sanitizedData.plus_one,
        sanitizedData.plus_one_name || undefined
      );
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await sendAdminRSVPNotification(
        sanitizedData.guest_name,
        sanitizedData.attending,
        sanitizedData.plus_one,
        sanitizedData.guest_email
      );
    } catch (emailError) {
      console.error("Error sending admin notification:", emailError);
      // Don't fail the request if email fails
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "RSVP submitted successfully!",
        rsvp: {
          id: rsvp.id,
          guest_name: rsvp.guestName,
          attending: rsvp.attending,
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in POST /api/rsvp:", error);
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

/**
 * PUT /api/rsvp
 * Update an existing RSVP (requires valid token)
 */
export const PUT: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Get client identifier
    const identifier = clientAddress || "unknown";

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({
          error:
            "Too many RSVP submissions. Please wait a few minutes and try again.",
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

    // Validate token is provided
    if (!body.token || typeof body.token !== "string") {
      return new Response(
        JSON.stringify({
          error: "Authentication token is required to update RSVP",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate token format
    if (!isValidTokenFormat(body.token)) {
      return new Response(
        JSON.stringify({
          error: "Invalid authentication token",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Look up and validate token
    const tokenRecord = await prisma.rSVPModificationToken.findUnique({
      where: {
        token: body.token,
      },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        used: true,
      },
    });

    if (!tokenRecord) {
      return new Response(
        JSON.stringify({
          error: "Invalid or expired authentication token",
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
          error: "This authentication token has already been used",
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
          error:
            "This authentication token has expired. Please request a new one.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Token is valid, use email from token (not from body for security)
    const email = tokenRecord.email;

    // Validate required fields
    if (!body.guest_email || typeof body.guest_email !== "string") {
      return new Response(
        JSON.stringify({
          error: "Email address is required to update RSVP",
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
    if (!isValidEmail(body.guest_email)) {
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

    // Ensure the email in body matches the token's email
    if (body.guest_email.trim().toLowerCase() !== email) {
      return new Response(
        JSON.stringify({
          error: "Email address does not match authentication token",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Find existing RSVP
    const existingRSVP = await prisma.rSVP.findFirst({
      where: {
        guestEmail: email,
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

    // Validate attending field if provided
    if (body.attending !== undefined && typeof body.attending !== "boolean") {
      return new Response(
        JSON.stringify({
          error: "Please indicate if you will be attending",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate plus one
    if (body.plus_one && !body.plus_one_name) {
      return new Response(
        JSON.stringify({
          error: "Please provide your plus-one's name",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.guest_name !== undefined) {
      updateData.guestName = sanitizeInput(body.guest_name.trim());
    }

    if (body.attending !== undefined) {
      updateData.attending = body.attending;
    }

    if (body.plus_one !== undefined) {
      updateData.plusOne = body.plus_one;
      updateData.plusOneName = body.plus_one_name
        ? sanitizeInput(body.plus_one_name.trim())
        : null;
      updateData.numberOfGuests = body.plus_one ? 2 : 1;
    }

    if (body.dietary_restrictions !== undefined) {
      updateData.dietaryRestrictions = body.dietary_restrictions
        ? sanitizeInput(body.dietary_restrictions.trim())
        : null;
    }

    if (body.song_requests !== undefined) {
      updateData.songRequests = body.song_requests
        ? sanitizeInput(body.song_requests.trim())
        : null;
    }

    if (body.special_accommodations !== undefined) {
      updateData.specialAccommodations = body.special_accommodations
        ? sanitizeInput(body.special_accommodations.trim())
        : null;
    }

    // Update RSVP in database
    const updatedRSVP = await prisma.rSVP.update({
      where: {
        id: existingRSVP.id,
      },
      data: updateData,
    });

    // Mark token as used
    await prisma.rSVPModificationToken.update({
      where: {
        id: tokenRecord.id,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Send confirmation email for the update
    try {
      await sendRSVPConfirmation(
        updatedRSVP.guestEmail,
        updatedRSVP.guestName,
        updatedRSVP.attending,
        updatedRSVP.plusOne,
        updatedRSVP.plusOneName || undefined
      );
    } catch (emailError) {
      console.error("Error sending update confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "RSVP updated successfully!",
        rsvp: {
          id: updatedRSVP.id,
          guest_name: updatedRSVP.guestName,
          attending: updatedRSVP.attending,
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
    console.error("Error in PUT /api/rsvp:", error);
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

export const GET: APIRoute = async ({ clientAddress }) => {
  try {
    // Get client identifier
    const identifier = clientAddress || "unknown";

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({
          error:
            "Too many RSVP submissions. Please wait a few minutes and try again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const rsvp_list = await prisma.rSVP.findMany({});
    return new Response(JSON.stringify(rsvp_list), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/rsvp:", error);
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
