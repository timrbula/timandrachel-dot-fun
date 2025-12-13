import type { APIRoute } from "astro";
import { getSupabase } from "../../lib/supabase";
import { sanitizeInput, isValidEmail } from "../../lib/utils";
import {
  sendRSVPConfirmation,
  sendAdminRSVPNotification,
} from "../../lib/resend";

// Rate limiting map
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 300000; // 5 minutes
const MAX_REQUESTS = 3; // Max 3 RSVP submissions per 5 minutes per IP

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
    const supabase = getSupabase();
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
    const { data: existingRSVP, error: checkError } = await supabase
      .from("rsvps")
      .select("id")
      .eq("guest_email", sanitizedData.guest_email)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for duplicate RSVP:", checkError);
      return new Response(
        JSON.stringify({
          error: "Failed to check for existing RSVP",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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

    // Insert RSVP into database
    const { data: rsvp, error: insertError } = await supabase
      .from("rsvps")
      .insert([sanitizedData])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting RSVP:", insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to save RSVP. Please try again.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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
          guest_name: rsvp.guest_name,
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

// Made with Bob
