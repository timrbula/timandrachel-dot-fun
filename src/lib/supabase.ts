import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Environment variables - support both Astro (import.meta.env) and Node.js (process.env)
const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
  process.env.SUPABASE_URL;
const supabaseServiceKey =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.SUPABASE_SERVICE_KEY) ||
  process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    "Missing SUPABASE_URL environment variable. Please check your .env file."
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_KEY environment variable. Please check your .env file."
  );
}

// Create Supabase client with service role key
// This client has full access to the database and bypasses RLS
// IMPORTANT: Only use this in API routes (server-side), never in client code
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper function to get Supabase client (for backwards compatibility)
export function getSupabase(): SupabaseClient {
  return supabase;
}

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseServiceKey;
}

// Database Types
export interface RSVP {
  id: string;
  created_at: string;
  guest_name: string;
  guest_email: string;
  attending: boolean;
  plus_one: boolean;
  plus_one_name?: string;
  dietary_restrictions?: string;
  song_requests?: string;
  special_accommodations?: string;
  number_of_guests: number;
}

export interface GuestbookEntry {
  id: string;
  created_at: string;
  name: string;
  message: string;
  location?: string;
}

export interface VisitorCount {
  id: number;
  count: number;
  last_updated: string;
}

// Helper functions for common operations

/**
 * Submit RSVP
 */
export async function submitRSVP(data: Omit<RSVP, "id" | "created_at">) {
  const { data: rsvp, error } = await supabase
    .from("rsvps")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error submitting RSVP:", error);
    throw error;
  }

  return rsvp;
}

/**
 * Get all RSVPs (admin only - requires service role key)
 */
export async function getAllRSVPs(): Promise<RSVP[]> {
  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching RSVPs:", error);
    throw error;
  }

  return data || [];
}

/**
 * Submit guestbook entry
 */
export async function submitGuestbookEntry(
  name: string,
  message: string,
  location?: string
): Promise<GuestbookEntry> {
  const { data, error } = await supabase
    .from("guestbook")
    .insert([{ name, message, location }])
    .select()
    .single();

  if (error) {
    console.error("Error submitting guestbook entry:", error);
    throw error;
  }

  return data;
}

/**
 * Get guestbook entries (paginated)
 */
export async function getGuestbookEntries(
  page: number = 1,
  limit: number = 10
): Promise<GuestbookEntry[]> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("guestbook")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching guestbook entries:", error);
    throw error;
  }

  return data || [];
}

/**
 * Increment visitor count using the database function
 */
export async function incrementVisitorCount(): Promise<number> {
  const { data, error } = await supabase.rpc("increment_visitor_count");

  if (error) {
    console.error("Error incrementing visitor count:", error);
    return 0;
  }

  return data || 0;
}

/**
 * Get current visitor count
 */
export async function getVisitorCount(): Promise<number> {
  const { data, error } = await supabase
    .from("visitor_count")
    .select("count")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching visitor count:", error);
    return 0;
  }

  return data?.count || 0;
}

export default supabase;

// Made with Bob
