import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { runAgent } from "@/lib/ai/agent";
import { createHmac } from "crypto";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from: { id: number; first_name: string };
    text?: string;
  };
}

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string
) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
}

export async function POST(request: Request) {
  const webhookSecret = request.headers.get("x-telegram-bot-api-secret-token");
  const body: TelegramUpdate = await request.json();

  if (!body.message?.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = body.message.chat.id;
  const userText = body.message.text;

  const supabase = createSupabaseAdmin();

  // Find the user by telegram_chat_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_chat_id", chatId.toString())
    .single();

  if (!profile) {
    // Unknown chat - ignore or respond with setup instructions
    return NextResponse.json({ ok: true });
  }

  // Validate webhook secret
  const { data: telegramConfig } = await supabase
    .from("telegram_config")
    .select("bot_token_encrypted, webhook_secret, is_active")
    .eq("user_id", profile.id)
    .single();

  if (!telegramConfig?.is_active) {
    return NextResponse.json({ ok: true });
  }

  if (webhookSecret !== telegramConfig.webhook_secret) {
    return NextResponse.json({ error: "Segredo inválido" }, { status: 403 });
  }

  // Get n8n credentials
  const { data: credentials } = await supabase
    .from("n8n_credentials")
    .select("base_url_encrypted, api_key_encrypted")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .single();

  if (!credentials) {
    const { decrypt } = await import("@/lib/encryption");
    const botToken = decrypt(telegramConfig.bot_token_encrypted);
    await sendTelegramMessage(
      botToken,
      chatId,
      "Por favor, configure suas credenciais n8n no aplicativo Agent007 primeiro."
    );
    return NextResponse.json({ ok: true });
  }

  // Save user message
  await supabase.from("chat_history").insert({
    user_id: profile.id,
    role: "user",
    content: userText,
    source: "telegram",
  });

  // Get recent chat history for context
  const { data: history } = await supabase
    .from("chat_history")
    .select("role, content")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const messages = (history ?? [])
    .reverse()
    .filter((m: { role: string; content: string }) => m.role === "user" || m.role === "assistant")
    .map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // Run AI agent
  try {
    const result = runAgent({
      messages,
      n8nBaseUrlEncrypted: credentials.base_url_encrypted,
      n8nApiKeyEncrypted: credentials.api_key_encrypted,
    });

    // Collect the full response (non-streaming for Telegram)
    let fullResponse = "";
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
    }

    // Save assistant response
    await supabase.from("chat_history").insert({
      user_id: profile.id,
      role: "assistant",
      content: fullResponse,
      source: "telegram",
    });

    // Send to Telegram
    const { decrypt } = await import("@/lib/encryption");
    const botToken = decrypt(telegramConfig.bot_token_encrypted);
    await sendTelegramMessage(botToken, chatId, fullResponse);
  } catch (error) {
    console.error("Telegram agent error:", error);
    const { decrypt } = await import("@/lib/encryption");
    const botToken = decrypt(telegramConfig.bot_token_encrypted);
    await sendTelegramMessage(
      botToken,
      chatId,
      "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."
    );
  }

  return NextResponse.json({ ok: true });
}
