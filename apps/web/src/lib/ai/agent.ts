import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { AI_CONFIG } from "shared";
import { N8nClient } from "@/lib/n8n-client";
import { createN8nTools } from "./tools";
import { decrypt } from "@/lib/encryption";

interface AgentInput {
  messages: { role: "user" | "assistant"; content: string }[];
  n8nBaseUrlEncrypted: string;
  n8nApiKeyEncrypted: string;
}

export function runAgent({ messages, n8nBaseUrlEncrypted, n8nApiKeyEncrypted }: AgentInput) {
  const baseUrl = decrypt(n8nBaseUrlEncrypted);
  const apiKey = decrypt(n8nApiKeyEncrypted);
  const n8nClient = new N8nClient(baseUrl, apiKey);
  const tools = createN8nTools(n8nClient);

  return streamText({
    model: anthropic(AI_CONFIG.MODEL),
    system: AI_CONFIG.SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 5,
  });
}
