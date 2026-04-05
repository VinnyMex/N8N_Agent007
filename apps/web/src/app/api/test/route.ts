import { NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET() {
  // Only available in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const results: Record<string, { status: string; detail?: string }> = {};

  // Test 1: Encryption round-trip
  try {
    const testString = "test-api-key-12345";
    const encrypted = encrypt(testString);
    const decrypted = decrypt(encrypted);
    results.encryption = {
      status: decrypted === testString ? "pass" : "fail",
      detail: decrypted === testString
        ? "AES-256-GCM encryption/decryption working"
        : "Decrypted value does not match original",
    };
  } catch (err) {
    results.encryption = {
      status: "fail",
      detail: err instanceof Error ? err.message : "Unknown error",
    };
  }

  // Test 2: Supabase connection
  try {
    const { createSupabaseAdmin } = await import("@/lib/supabase/server");
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    results.supabase = {
      status: error ? "fail" : "pass",
      detail: error ? error.message : "Connected successfully",
    };
  } catch (err) {
    results.supabase = {
      status: "fail",
      detail: err instanceof Error ? err.message : "Unknown error",
    };
  }

  // Test 3: Environment variables
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
    "ENCRYPTION_KEY",
  ];

  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  results.environment = {
    status: missingVars.length === 0 ? "pass" : "fail",
    detail:
      missingVars.length === 0
        ? "All required environment variables set"
        : `Missing: ${missingVars.join(", ")}`,
  };

  const allPassing = Object.values(results).every((r) => r.status === "pass");

  return NextResponse.json(
    {
      overall: allPassing ? "all_tests_passing" : "some_tests_failing",
      tests: results,
    },
    { status: allPassing ? 200 : 500 }
  );
}
