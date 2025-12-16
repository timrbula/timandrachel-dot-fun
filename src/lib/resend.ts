import { Resend } from "resend";

// Environment variable
const resendApiKey = import.meta.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "Missing RESEND_API_KEY environment variable. Email functionality will be disabled."
  );
}

// Create Resend client
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email configuration
export const EMAIL_CONFIG = {
  from: "Rachel & Tim <sup@rachelandtim.fun>",
  replyTo: "hello@rachelandtim.fun",
};

// Email templates

/**
 * Send RSVP confirmation email
 */
export async function sendRSVPConfirmation(
  to: string,
  name: string,
  attending: boolean,
  plusOne: boolean,
  plusOneName?: string
) {
  if (!resend) {
    console.warn("Resend client not initialized. Skipping email.");
    return null;
  }

  const subject = attending
    ? "🎉 We can't wait to celebrate with you!"
    : "💔 We'll miss you at our wedding";

  const html = attending
    ? `
      <div style="font-family: 'Comic Sans MS'; background: linear-gradient(180deg, #000080, #008080); color: #FFFFFF; padding: 2rem; text-align: center;">
        <h1 style="color: #FF00FF; text-shadow: 2px 2px 0 #00FFFF;">💕 RSVP Confirmed! 💕</h1>
        <p style="font-size: 1.2rem;">Hey ${name}!</p>
        <p style="font-size: 1.1rem;">We're EXCITED that you'll be joining us on October 9th, 2026!</p>
        ${plusOne ? `<p style="font-size: 1.1rem;">And we can't wait to celebrate with you and ${plusOneName || "your plus one"}!</p>` : ""}
        <p style="font-size: 1rem; margin-top: 2rem;">Check out our website for all the details:</p>
        <a href="https://rachelandtim.fun" style="display: inline-block; padding: 1rem 2rem; background: linear-gradient(180deg, #FF00FF, #8000FF); color: #FFFF00; text-decoration: none; font-weight: bold; border: 3px outset #FF00FF; margin: 1rem 0;">Visit Our Website</a>
        <p style="font-size: 0.9rem; margin-top: 2rem; color: #00FFFF;">See you there! 🗽✨</p>
      </div>
    `
    : `
      <div style="font-family: 'Comic Sans MS'; background: linear-gradient(180deg, #000080, #008080); color: #FFFFFF; padding: 2rem; text-align: center;">
        <h1 style="color: #FF00FF; text-shadow: 2px 2px 0 #00FFFF;">💔 We'll Miss You! 💔</h1>
        <p style="font-size: 1.2rem;">Hey ${name},</p>
        <p style="font-size: 1.1rem;">We're sad you can't make it to our wedding, but we totally understand!</p>
        <p style="font-size: 1rem;">We'll be thinking of you on our special day. 💕</p>
        <p style="font-size: 0.9rem; margin-top: 2rem; color: #00FFFF;">Much love! 🗽✨</p>
      </div>
    `;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      replyTo: EMAIL_CONFIG.replyTo,
    });

    if (error) {
      console.error("Error sending RSVP confirmation:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}

/**
 * Send admin notification for new RSVP
 */
export async function sendAdminRSVPNotification(
  guestName: string,
  attending: boolean,
  plusOne: boolean,
  email: string
) {
  if (!resend) {
    console.warn("Resend client not initialized. Skipping email.");
    return null;
  }

  const subject = `New RSVP: ${guestName} - ${attending ? "Attending" : "Not Attending"}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 1rem;">
      <h2>New RSVP Received</h2>
      <p><strong>Name:</strong> ${guestName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Attending:</strong> ${attending ? "Yes ✅" : "No ❌"}</p>
      <p><strong>Plus One:</strong> ${plusOne ? "Yes" : "No"}</p>
      <p style="margin-top: 2rem; font-size: 0.9rem; color: #666;">
        View all RSVPs in your Supabase dashboard.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.replyTo,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending admin notification:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}

/**
 * Send guestbook entry notification
 */
export async function sendGuestbookNotification(name: string, message: string) {
  if (!resend) {
    console.warn("Resend client not initialized. Skipping email.");
    return null;
  }

  const subject = `New Guestbook Entry from ${name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 1rem;">
      <h2>New Guestbook Entry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #FF00FF; padding-left: 1rem; margin: 1rem 0;">
        ${message}
      </blockquote>
      <p style="margin-top: 2rem; font-size: 0.9rem; color: #666;">
        Approve this entry in your Supabase dashboard to make it visible on the website.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.replyTo,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending guestbook notification:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}

/**
 * Send magic link email for RSVP modification
 */
export async function sendMagicLinkEmail(
  to: string,
  name: string,
  token: string
) {
  if (!resend) {
    console.warn("Resend client not initialized. Skipping email.");
    return null;
  }

  const magicLink = `https://rachelandtim.fun/rsvp/edit?token=${token}`;
  const subject = "✨ Edit Your RSVP - Rachel & Tim's Wedding";

  const html = `
    <div style="font-family: 'Comic Sans MS'; background: linear-gradient(180deg, #000080, #008080); color: #FFFFFF; padding: 2rem; text-align: center;">
      <h1 style="color: #FF00FF; text-shadow: 2px 2px 0 #00FFFF;">✨ Edit Your RSVP ✨</h1>
      <p style="font-size: 1.2rem;">Hey ${name}!</p>
      <p style="font-size: 1.1rem;">Click the button below to edit your RSVP for our wedding:</p>
      <a href="${magicLink}" style="display: inline-block; padding: 1rem 2rem; background: linear-gradient(180deg, #FF00FF, #8000FF); color: #FFFF00; text-decoration: none; font-weight: bold; border: 3px outset #FF00FF; margin: 2rem 0; font-size: 1.2rem;">Edit My RSVP</a>
      <p style="font-size: 0.9rem; color: #00FFFF;">This link will expire in 15 minutes for security.</p>
      <p style="font-size: 0.8rem; color: #CCCCCC; margin-top: 2rem;">If you didn't request this, you can safely ignore this email.</p>
      <p style="font-size: 0.9rem; margin-top: 2rem; color: #00FFFF;">See you at the wedding! 🗽✨</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      replyTo: EMAIL_CONFIG.replyTo,
    });

    if (error) {
      console.error("Error sending magic link email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}

export default resend;

// Made with Bob
