import type { APIRoute } from "astro";
import { prisma } from "../../lib/supabase";

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
    // Get current count from database
    const visitorCount = await prisma.visitorCount.findUnique({
      where: { id: 1 },
      select: { count: true },
    });

    return new Response(
      JSON.stringify({
        count: visitorCount?.count || 0,
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

    // Use upsert to increment the counter atomically
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

    return new Response(
      JSON.stringify({
        count: result.count,
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