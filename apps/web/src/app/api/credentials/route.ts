import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import { n8nCredentialSchema } from "@/lib/shared";
import { N8nClient } from "@/lib/n8n-client";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  console.log("POST /api/credentials - user:", user?.id);
  
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  
  const body = await request.json();
  console.log("POST body:", body);
  
  const parsed = n8nCredentialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  
  const client = new N8nClient(parsed.data.baseUrl, parsed.data.apiKey);
  const healthy = await client.healthCheck();
  
  console.log("Health check result:", healthy);
  
  if (!healthy) {
    return NextResponse.json(
      {
        error:
          "Não foi possível conectar à sua instância n8n. Verifique a URL e a chave API.",
      },
      { status: 400 }
    );
  }
  
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
  
  console.log("Save result - error:", error);
  
  if (error) {
    return NextResponse.json(
      { error: "Falha ao salvar credenciais: " + error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, user_id: user.id });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const { id, instanceName, baseUrl, apiKey, action } = body;
  if (action === "test") {
    try {
      let n8nUrl = baseUrl;
      let n8nKey = apiKey;
      
      if (!n8nUrl && !n8nKey && id) {
        const { data: cred } = await supabase
          .from("n8n_credentials")
          .select("base_url_encrypted, api_key_encrypted")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        
        if (cred) {
          const { decrypt } = await import("@/lib/encryption");
          n8nUrl = decrypt(cred.base_url_encrypted);
          n8nKey = decrypt(cred.api_key_encrypted);
        }
      }
      
      if (!n8nUrl || !n8nKey) {
        return NextResponse.json(
          { error: "Credenciais não encontradas" },
          { status: 400 }
        );
      }
      
      const client = new N8nClient(n8nUrl, n8nKey);
      const healthy = await client.healthCheck();
      if (healthy) {
        return NextResponse.json({
          success: true,
          message: "Conexão estabelecida com sucesso!"
        });
      } else {
        return NextResponse.json(
          { error: "Não foi possível conectar à instância n8n" },
          { status: 400 }
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha na conexão";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }
  if (action === "update") {
    const parsed = n8nCredentialSchema.safeParse({ instanceName, baseUrl, apiKey });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const client = new N8nClient(parsed.data.baseUrl, parsed.data.apiKey);
    const healthy = await client.healthCheck();
    if (!healthy) {
      return NextResponse.json(
        { error: "Não foi possível conectar à instância n8n. Verifique a URL e a chave API." },
        { status: 400 }
      );
    }
    const { error } = await supabase.from("n8n_credentials").update({
      instance_name: parsed.data.instanceName,
      base_url_encrypted: encrypt(parsed.data.baseUrl),
      api_key_encrypted: encrypt(parsed.data.apiKey),
      is_active: true,
      last_health_check: new Date().toISOString(),
    }).eq("id", id).eq("user_id", user.id);
    if (error) {
      return NextResponse.json({ error: "Falha ao atualizar credenciais" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }
  if (action === "delete") {
    const { error } = await supabase.from("n8n_credentials").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      return NextResponse.json({ error: "Falha ao excluir credenciais" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}

export async function GET() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  console.log("GET /api/credentials - user:", user?.id, "authError:", authError);
  
  if (!user) {
    return NextResponse.json({ error: "Não autorizado", credentials: [] }, { status: 401 });
  }
  
  const { data, error } = await supabase
    .from("n8n_credentials")
    .select("id, instance_name, is_active, last_health_check, created_at")
    .eq("user_id", user.id);
    
  console.log("Credentials query - data:", data, "error:", error);
  
  return NextResponse.json({ credentials: data ?? [], error: error?.message });
}
