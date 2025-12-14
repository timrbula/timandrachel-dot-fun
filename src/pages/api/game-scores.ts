import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import { sanitizeInput } from "../../lib/utils";

// Rate limiting map
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 6000; // 1 minute

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
 * GET /api/game-scores
 * Fetch top 10 leaderboard scores
 */
export const GET: APIRoute = async () => {
  try {
    // Fetch top 10 scores from database
    const scores = await prisma.gameScore.findMany({
      orderBy: {
        score: "desc",
      },
      take: 10,
      select: {
        id: true,
        name: true,
        score: true,
        createdAt: true,
      },
    });

    // Format scores to match API format
    const formattedScores = scores.map((entry, index) => ({
      id: entry.id,
      rank: index + 1,
      name: entry.name,
      score: entry.score,
      created_at: entry.createdAt.toISOString(),
    }));

    return new Response(
      JSON.stringify({
        leaderboard: formattedScores,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30", // Cache for 30 seconds
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/game-scores:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        leaderboard: [],
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
 * POST /api/game-scores
 * Submit a new game score
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
            "Too many score submissions. Please wait a moment and try again.",
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

    if (typeof body.score !== "number" || body.score < 0) {
      return new Response(
        JSON.stringify({
          error: "Valid score is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate name length
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

    if (body.name.trim().length > 50) {
      return new Response(
        JSON.stringify({
          error: "Name must be less than 50 characters",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate score is reasonable (max 9999)
    if (body.score > 9999) {
      return new Response(
        JSON.stringify({
          error: "Score seems too high. Please play fairly!",
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
      score: body.score,
    };

    // Insert score into database
    const entry = await prisma.gameScore.create({
      data: sanitizedData,
    });

    // Get updated rank
    const rank = await prisma.gameScore.count({
      where: {
        score: {
          gt: entry.score,
        },
      },
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Score submitted successfully!",
        entry: {
          id: entry.id,
          name: entry.name,
          score: entry.score,
          rank: rank + 1,
          created_at: entry.createdAt.toISOString(),
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
    console.error("Error in POST /api/game-scores:", error);
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
