import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import { n8nCredentialSchema } from "shared";
import { N8nClient } from "@/lib/n8n-client";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = n8nCredentialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Health check the n8n instance before saving
  const client = new N8nClient(parsed.data.baseUrl, parsed.data.apiKey);
  const healthy = await client.healthCheck();

  if (!healthy) {
    return NextResponse.json(
      {
        error:
          "Could not connect to your n8n instance. Please verify the URL and API key.",
      },
      { status: 400 }
    );
  }

  // Encrypt and save
  const { error } = await supabase.from("n8n_credentials").upsert(
    {
      user_id: user.id,
      instance_name: parsed.data.instanceName,
      base_url_encrypted: encrypt(parsed.data.baseUrl),
      api_key_encrypted: encrypt(parsed.data.apiKey),
      is_active: true,
      last_health_check: new Date().toISOString(),
    },
    { onConflict: "user_id,instance_name" }
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to save credentials" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("n8n_credentials")
    .select("id, instance_name, is_active, last_health_check, created_at")
    .eq("user_id", user.id);

  return NextResponse.json({ credentials: data ?? [] });
}
