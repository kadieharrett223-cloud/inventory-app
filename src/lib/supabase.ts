import { appConfig } from "@/lib/config";

export type SupabaseConnectionState = {
  ready: boolean;
  reason: string;
};

export function getSupabaseConnectionState(): SupabaseConnectionState {
  if (!appConfig.supabaseUrl || !appConfig.supabaseAnonKey) {
    return {
      ready: false,
      reason: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  return {
    ready: true,
    reason: "Supabase env vars detected",
  };
}
