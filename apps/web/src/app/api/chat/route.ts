import { createSupabaseServer } from "@/lib/supabase/server";
import { runAgent } from "@/lib/ai/agent";
import { chatMessageSchema } from "shared";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Rate limiting
  const { data: allowed } = await supabase.rpc("check_rate_limit", {
    p_user_id: user.id,
    p_endpoint: "chat",
    p_max_requests: 30,
    p_window_seconds: 60,
  });

  if (!allowed) {
    return new Response("Rate limit exceeded. Please wait a moment.", {
      status: 429,
    });
  }

  // Get user's n8n credentials
  const { data: credentials } = await supabase
    .from("n8n_credentials")
    .select("base_url_encrypted, api_key_encrypted")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!credentials) {
    return new Response(
      "No n8n credentials configured. Please add your n8n instance in Settings.",
      { status: 400 }
    );
  }

  const body = await request.json();
  const { messages } = body;

  // Save user message
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user") {
    const parsed = chatMessageSchema.safeParse({
      content: lastMessage.content,
    });
    if (parsed.success) {
      await supabase.from("chat_history").insert({
        user_id: user.id,
        role: "user",
        content: parsed.data.content,
        source: "app",
      });
    }
  }

  const result = runAgent({
    messages,
    n8nBaseUrlEncrypted: credentials.base_url_encrypted,
    n8nApiKeyEncrypted: credentials.api_key_encrypted,
  });

  return result.toDataStreamResponse();
}
