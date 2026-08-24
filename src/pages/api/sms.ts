import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import { sendBulkSms } from "../../lib/sms";

// Simple authentication check (matches other admin endpoints)
const ADMIN_SECRET = import.meta.env.ADMIN_SECRET || "change-me-in-production";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${ADMIN_SECRET}`;
}

/**
 * POST /api/sms
 * Send a text message to every guest who RSVP'd as attending and has a
 * phone number on file.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    if (
      !body.message ||
      typeof body.message !== "string" ||
      !body.message.trim()
    ) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find guests who are attending and have a phone number on file
    const guests = await prisma.guest.findMany({
      where: {
        phone: { not: null },
        rsvps: {
          some: { attending: true },
        },
      },
      select: { id: true, name: true, phone: true },
    });

    const recipients = guests
      .map((g) => g.phone)
      .filter((phone): phone is string => !!phone && phone.trim() !== "");

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No attending guests with a phone number found",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const results = await sendBulkSms(recipients, body.message.trim());
    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        failed: failed.length,
        total: recipients.length,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in POST /api/sms:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send text messages" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Made with Bob
