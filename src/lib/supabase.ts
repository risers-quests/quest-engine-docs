import { createClient } from "@supabase/supabase-js";

// Server-side only: API routes call Supabase with the service role key.
// There is no client-side Supabase usage — no auth, single implicit user (docs/06_data_model.md).
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createClient(url, serviceRoleKey);
}
