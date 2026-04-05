import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized", details: authError?.message }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("ai_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "42P01") {
    return NextResponse.json(
      { error: "Tabela ai_settings não existe. Execute a migration 004_ai_settings.sql no Supabase.", code: "MISSING_TABLE" },
      { status: 500 }
    );
  }

  if (error && error.code !== "PGRST116") {
    return NextResponse.json(
      { error: "Failed to load AI settings", details: error.message, code: error.code },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings: data });
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      provider,
      apiKey,
      model,
      baseUrl,
      systemPrompt,
      maxTokens,
      maxSteps,
      temperature,
    } = body;

    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { error: "Provider, API key, and model are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ai_settings")
      .insert({
        user_id: user.id,
        provider,
        api_key: apiKey,
        model,
        base_url: baseUrl || null,
        system_prompt: systemPrompt || null,
        max_tokens: maxTokens ?? 4096,
        max_steps: maxSteps ?? 5,
        temperature: temperature ?? 0.3,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "Tabela ai_settings não existe. Execute a migration 004_ai_settings.sql no Supabase.", code: "MISSING_TABLE", details: error },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "Failed to save AI settings", details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: data });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    id,
    provider,
    apiKey,
    model,
    baseUrl,
    systemPrompt,
    maxTokens,
    maxSteps,
    temperature,
    isActive,
  } = body;

  const updates: Record<string, unknown> = {};
  if (provider !== undefined) updates.provider = provider;
  if (apiKey !== undefined) updates.api_key = apiKey;
  if (model !== undefined) updates.model = model;
  if (baseUrl !== undefined) updates.base_url = baseUrl;
  if (systemPrompt !== undefined) updates.system_prompt = systemPrompt;
  if (maxTokens !== undefined) updates.max_tokens = maxTokens;
  if (maxSteps !== undefined) updates.max_steps = maxSteps;
  if (temperature !== undefined) updates.temperature = temperature;
  if (isActive !== undefined) updates.is_active = isActive;

  const { data, error } = await supabase
    .from("ai_settings")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update AI settings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings: data });
}
