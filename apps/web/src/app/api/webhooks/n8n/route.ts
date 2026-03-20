import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

interface N8nWebhookPayload {
  executionId: string;
  workflowId: string;
  workflowName: string;
  status: "success" | "error";
  errorMessage?: string;
  startedAt: string;
  finishedAt: string;
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = authHeader.slice(7); // Simple user-scoped token
  const body: N8nWebhookPayload = await request.json();

  const supabase = createSupabaseAdmin();

  // Verify user exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, telegram_chat_id")
    .eq("id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Log the execution
  await supabase.from("execution_logs").insert({
    user_id: profile.id,
    workflow_id: body.workflowId,
    workflow_name: body.workflowName,
    execution_id: body.executionId,
    status: body.status,
    error_message: body.errorMessage,
    started_at: body.startedAt,
    finished_at: body.finishedAt,
  });

  // If error, send notifications
  if (body.status === "error" && profile.telegram_chat_id) {
    const { data: telegramConfig } = await supabase
      .from("telegram_config")
      .select("bot_token_encrypted, is_active")
      .eq("user_id", profile.id)
      .single();

    if (telegramConfig?.is_active) {
      const { decrypt } = await import("@/lib/encryption");
      const botToken = decrypt(telegramConfig.bot_token_encrypted);

      const message = `⚠️ *Workflow Error*\n\n*Workflow:* ${body.workflowName}\n*Execution:* ${body.executionId}\n*Error:* ${body.errorMessage ?? "Unknown error"}\n*Time:* ${body.finishedAt}`;

      await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: parseInt(profile.telegram_chat_id),
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );
    }
  }

  return NextResponse.json({ success: true });
}
