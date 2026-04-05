import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };

  // Check Supabase connectivity
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  checks.supabase = supabaseUrl && supabaseKey ? "configured" : "missing";

  // Check Anthropic API key
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? "configured" : "missing";

  // Check encryption key
  const encKey = process.env.ENCRYPTION_KEY;
  checks.encryption =
    encKey && encKey.length === 64 ? "configured" : "missing";

  const allConfigured = Object.values(checks).every(
    (v) => v !== "missing"
  );

  return NextResponse.json(checks, {
    status: allConfigured ? 200 : 503,
  });
}
