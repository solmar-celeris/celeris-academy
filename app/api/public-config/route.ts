import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET() {
  const { env } = getCloudflareContext();
  const runtimeEnv = env as Record<string, string | undefined>;
  const url = runtimeEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = runtimeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return Response.json(
      { configured: false, message: "As variáveis públicas do Supabase não estão disponíveis no Worker." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json(
    { configured: true, url, anonKey },
    { headers: { "Cache-Control": "no-store" } }
  );
}
