export const appConfig = {
  appName: "Forge Ledger Inventory",
  env: process.env.NODE_ENV,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  qboClientId: process.env.QBO_CLIENT_ID,
  qboRealmId: process.env.QBO_REALM_ID,
  qboRedirectUri: process.env.QBO_REDIRECT_URI,
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO,
  vercelProject: process.env.NEXT_PUBLIC_VERCEL_PROJECT,
};

export function validateConfig() {
  return {
    hasSupabase: Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey),
    hasQbo: Boolean(appConfig.qboClientId && appConfig.qboRealmId),
  };
}
