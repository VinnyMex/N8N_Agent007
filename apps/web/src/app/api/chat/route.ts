import { createSupabaseServer } from "@/lib/supabase/server";
import { runAgent } from "@/lib/ai/agent";
import { chatMessageSchema } from "@/lib/shared";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use env vars for n8n credentials (fallback)
  const baseUrl = process.env.N8N_BASE_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!baseUrl || !apiKey) {
    return new Response(
      "Credenciais n8n não configuradas no servidor.",
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

  try {
    const result = runAgent({
      messages,
      n8nBaseUrlEncrypted: undefined,
      n8nApiKeyEncrypted: undefined,
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error("Chat - runAgent error:", err);
    return new Response(
      "Erro ao executar agente: " + (err instanceof Error ? err.message : String(err)),
      { status: 500 }
    );
  }
}
