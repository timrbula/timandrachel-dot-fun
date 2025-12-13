import type { APIRoute } from "astro";
import { getSupabase } from "../../lib/supabase";
import { sanitizeInput } from "../../lib/utils";
import { sendGuestbookNotification } from "../../lib/resend";

// Rate limiting map
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 300000; // 5 minutes
const MAX_REQUESTS = 5; // Max 5 guestbook entries per 5 minutes per IP

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
 * GET /api/guestbook
 * Fetch guestbook entries (paginated)
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = getSupabase();
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Validate pagination params
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 50); // Max 50 per page

    const from = (validPage - 1) * validLimit;
    const to = from + validLimit - 1;

    // Fetch entries from database
    const { data, error, count } = await supabase
      .from("guestbook")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching guestbook entries:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch guestbook entries",
          entries: [],
          hasMore: false,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const totalCount = count || 0;
    const hasMore = to < totalCount - 1;

    return new Response(
      JSON.stringify({
        entries: data || [],
        hasMore,
        total: totalCount,
        page: validPage,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60", // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/guestbook:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        entries: [],
        hasMore: false,
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
 * POST /api/guestbook
 * Submit a new guestbook entry
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
            "Too many guestbook entries. Please wait a few minutes and try again.",
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
    if (!body.name || typeof body.name !== "string") {
      return new Response(
        JSON.stringify({
          error: "Name is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!body.message || typeof body.message !== "string") {
      return new Response(
        JSON.stringify({
          error: "Message is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate lengths
    if (body.name.trim().length < 2) {
      return new Response(
        JSON.stringify({
          error: "Name must be at least 2 characters",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (body.message.trim().length < 5) {
      return new Response(
        JSON.stringify({
          error: "Message must be at least 5 characters",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (body.message.trim().length > 500) {
      return new Response(
        JSON.stringify({
          error: "Message must be less than 500 characters",
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
      name: sanitizeInput(body.name.trim()),
      message: sanitizeInput(body.message.trim()),
      location: body.location ? sanitizeInput(body.location.trim()) : null,
    };

    // Insert entry into database
    const { data: entry, error: insertError } = await supabase
      .from("guestbook")
      .insert([sanitizedData])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting guestbook entry:", insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to save guestbook entry. Please try again.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Send notification email to admin
    try {
      await sendGuestbookNotification(
        sanitizedData.name,
        sanitizedData.message
      );
    } catch (emailError) {
      console.error("Error sending guestbook notification:", emailError);
      // Don't fail the request if email fails
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Guestbook entry submitted successfully!",
        entry: {
          id: entry.id,
          name: entry.name,
          created_at: entry.created_at,
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
    console.error("Error in POST /api/guestbook:", error);
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
