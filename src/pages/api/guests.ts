import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import { sanitizeInput, isValidEmail } from "../../lib/utils";

// Simple authentication check (you should implement proper auth)
const ADMIN_SECRET = import.meta.env.ADMIN_SECRET || "change-me-in-production";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${ADMIN_SECRET}`;
}

/**
 * GET /api/guests
 * List all guests or search by name/email
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Check authentication
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const search = url.searchParams.get("search");

    let guests;
    if (search) {
      // Search by name or email
      guests = await prisma.guest.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        include: {
          rsvps: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      });
    } else {
      // Get all guests
      guests = await prisma.guest.findMany({
        include: {
          rsvps: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      });
    }

    return new Response(JSON.stringify({ guests }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/guests:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch guests" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST /api/guests
 * Create a new guest
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Check authentication
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (body.email && !isValidEmail(body.email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if guest already exists
    const existingGuest = await prisma.guest.findUnique({
      where: { email: body.email.trim().toLowerCase() },
    });

    if (existingGuest) {
      return new Response(
        JSON.stringify({ error: "Guest with this email already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        name: sanitizeInput(body.name.trim()),
        email: body.email.trim().toLowerCase(),
        allowPlusOne: body.allowPlusOne || false,
        maxGuests: body.maxGuests || 1,
        invitationSent: body.invitationSent || false,
        invitationSentAt: body.invitationSent ? new Date() : null,
        notes: body.notes ? sanitizeInput(body.notes.trim()) : null,
      },
    });

    return new Response(JSON.stringify({ guest }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/guests:", error);
    return new Response(JSON.stringify({ error: "Failed to create guest" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * PUT /api/guests
 * Update a guest
 */
export const PUT: APIRoute = async ({ request }) => {
  try {
    // Check authentication
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    if (!body.id) {
      return new Response(JSON.stringify({ error: "Guest ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build update data
    const updateData: any = {};

    if (body.name) updateData.name = sanitizeInput(body.name.trim());
    if (body.email) {
      if (!isValidEmail(body.email)) {
        return new Response(
          JSON.stringify({ error: "Invalid email address" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      updateData.email = body.email.trim().toLowerCase();
    }
    if (typeof body.allowPlusOne === "boolean")
      updateData.allowPlusOne = body.allowPlusOne;
    if (body.maxGuests) updateData.maxGuests = body.maxGuests;
    if (typeof body.invitationSent === "boolean") {
      updateData.invitationSent = body.invitationSent;
      if (body.invitationSent && !body.invitationSentAt) {
        updateData.invitationSentAt = new Date();
      }
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes ? sanitizeInput(body.notes.trim()) : null;
    }

    // Update guest
    const guest = await prisma.guest.update({
      where: { id: body.id },
      data: updateData,
    });

    return new Response(JSON.stringify({ guest }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/guests:", error);
    return new Response(JSON.stringify({ error: "Failed to update guest" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * DELETE /api/guests
 * Delete a guest
 */
export const DELETE: APIRoute = async ({ request }) => {
  try {
    // Check authentication
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    if (!body.id) {
      return new Response(JSON.stringify({ error: "Guest ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete guest (RSVPs will have guestId set to null due to onDelete: SetNull)
    await prisma.guest.delete({
      where: { id: body.id },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Guest deleted" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in DELETE /api/guests:", error);
    return new Response(JSON.stringify({ error: "Failed to delete guest" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Made with Bob
