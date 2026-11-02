import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Validates whether Supabase environment variables are configured.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("your-project.supabase.co") &&
    !supabaseAnonKey.includes("your-supabase-anon-key")
  );
};

/**
 * Standard Supabase client instance for client-side and server-side calls.
 * Gracefully returns null if Supabase environment variables are unconfigured.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Creates an admin / service-role Supabase client for backend operations.
 * Must only be called in server environments (API routes, Server Components).
 */
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured() || !serviceRoleKey || serviceRoleKey.includes("your-supabase-service-role-key")) {
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
