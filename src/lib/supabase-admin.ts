import { createClient } from "@supabase/supabase-js";
import { appConfig } from "@/lib/config";

export function getSupabaseAdminClient() {
  if (!appConfig.supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!appConfig.supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(appConfig.supabaseUrl, appConfig.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
