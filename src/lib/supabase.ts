import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization - only create client when needed
let supabaseClient: SupabaseClient | null = null;

// Helper to get Supabase client (creates it on first use)
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
      throw new Error(
        "Missing SUPABASE_URL environment variable. Please check your .env file."
      );
    }

    // We use a dummy anon key since we only use service role key in API routes
    supabaseClient = createClient(supabaseUrl, "dummy-key-for-build", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

// Helper to check if Supabase is configured with real URL
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.SUPABASE_URL;
  return !!url && url !== "https://placeholder.supabase.co";
}

// Export a getter for backwards compatibility
export const supabase = {
  get client() {
    return getSupabase();
  },
};

// Database Types (will be expanded as we build out features)
export interface Guest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  attending: boolean;
  plus_one: boolean;
  plus_one_name?: string;
  dietary_restrictions?: string;
  song_request?: string;
  message?: string;
}

export interface GuestbookEntry {
  id: string;
  created_at: string;
  name: string;
  message: string;
  approved: boolean;
}

export interface VisitorCount {
  id: string;
  count: number;
  last_updated: string;
}

// Helper functions for common operations

/**
 * Submit RSVP
 */
export async function submitRSVP(data: Omit<Guest, "id" | "created_at">) {
  const client = getSupabase();
  const { data: guest, error } = await client
    .from("guests")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error submitting RSVP:", error);
    throw error;
  }

  return guest;
}

/**
 * Get all RSVPs (admin only)
 */
export async function getAllRSVPs() {
  const client = getSupabase();
  const { data, error } = await client
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching RSVPs:", error);
    throw error;
  }

  return data;
}

/**
 * Submit guestbook entry
 */
export async function submitGuestbookEntry(name: string, message: string) {
  const client = getSupabase();
  const { data, error } = await client
    .from("guestbook")
    .insert([{ name, message, approved: false }])
    .select()
    .single();

  if (error) {
    console.error("Error submitting guestbook entry:", error);
    throw error;
  }

  return data;
}

/**
 * Get approved guestbook entries
 */
export async function getGuestbookEntries() {
  const client = getSupabase();
  const { data, error } = await client
    .from("guestbook")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching guestbook entries:", error);
    throw error;
  }

  return data;
}

/**
 * Increment visitor count
 */
export async function incrementVisitorCount() {
  const client = getSupabase();
  // First, try to get the current count
  const { data: existing, error: fetchError } = await client
    .from("visitor_count")
    .select("*")
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is "no rows returned" - that's okay
    console.error("Error fetching visitor count:", fetchError);
    return null;
  }

  if (existing) {
    // Update existing count
    const { data, error } = await client
      .from("visitor_count")
      .update({
        count: existing.count + 1,
        last_updated: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating visitor count:", error);
      return null;
    }

    return data;
  } else {
    // Create initial count
    const { data, error } = await client
      .from("visitor_count")
      .insert([{ count: 1 }])
      .select()
      .single();

    if (error) {
      console.error("Error creating visitor count:", error);
      return null;
    }

    return data;
  }
}

/**
 * Get current visitor count
 */
export async function getVisitorCount() {
  const client = getSupabase();
  const { data, error } = await client
    .from("visitor_count")
    .select("count")
    .single();

  if (error) {
    console.error("Error fetching visitor count:", error);
    return 0;
  }

  return data?.count || 0;
}

export default supabase;

// Made with Bob
