import type { APIRoute } from "astro";
import { getSupabase } from "../../lib/supabase";

// Rate limiting map (in-memory, simple implementation)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // Max 10 requests per minute per IP

/**
 * Simple rate limiting check
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
 * GET /api/counter
 * Fetch the current visitor count
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabase();
    // Get current count from database
    const { data, error } = await supabase
      .from("visitor_count")
      .select("count")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching visitor count:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch visitor count",
          count: 0,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        count: data?.count || 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/counter:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        count: 0,
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
 * POST /api/counter
 * Increment the visitor count
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Get client identifier (IP address or fallback)
    const identifier = clientAddress || "unknown";

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = getSupabase();

    // Use the database function to increment the counter atomically
    const { data: newCount, error } = await supabase.rpc(
      "increment_visitor_count"
    );

    if (error) {
      console.error("Error incrementing visitor count:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to increment visitor count",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        count: newCount,
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error in POST /api/counter:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
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
