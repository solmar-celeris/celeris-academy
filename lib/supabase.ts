import { createClient, SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient | null> | null = null;

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (browserClient) return browserClient;
  if (typeof window === "undefined") return null;

  if (!clientPromise) {
    clientPromise = fetch("/api/public-config", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const config = await response.json() as {
          configured?: boolean;
          url?: string;
          anonKey?: string;
        };
        if (!config.configured || !config.url || !config.anonKey) return null;
        browserClient = createClient(config.url, config.anonKey);
        return browserClient;
      })
      .catch(() => null);
  }

  return clientPromise;
}
