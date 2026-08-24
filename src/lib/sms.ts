import twilio from "twilio";

// Environment variables
const accountSid = import.meta.env.TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.TWILIO_AUTH_TOKEN;
const fromNumber = import.meta.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  console.warn(
    "Missing Twilio environment variables. SMS functionality will be disabled."
  );
}

// Create Twilio client
export const twilioClient =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface SmsSendResult {
  phone: string;
  success: boolean;
  error?: string;
}

/**
 * Send a text message to a single phone number
 */
export async function sendSms(to: string, body: string): Promise<SmsSendResult> {
  if (!twilioClient || !fromNumber) {
    console.warn("Twilio client not initialized. Skipping SMS.");
    return { phone: to, success: false, error: "Twilio client not initialized" };
  }

  try {
    await twilioClient.messages.create({
      to,
      from: fromNumber,
      body,
    });
    return { phone: to, success: true };
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error);
    return {
      phone: to,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a text message to multiple phone numbers
 */
export async function sendBulkSms(
  recipients: string[],
  body: string
): Promise<SmsSendResult[]> {
  return Promise.all(recipients.map((phone) => sendSms(phone, body)));
}

export default twilioClient;

// Made with Bob
