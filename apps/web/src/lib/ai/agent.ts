import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { AI_CONFIG } from "shared";
import { N8nClient } from "@/lib/n8n-client";
import { createN8nTools } from "./tools";
import { decrypt } from "@/lib/encryption";

interface AgentInput {
  messages: { role: "user" | "assistant"; content: string }[];
  n8nBaseUrlEncrypted: string;
  n8nApiKeyEncrypted: string;
}

function getModel() {
  // Prefer OpenRouter if configured, fallback to Anthropic direct
  if (process.env.OPENROUTER_API_KEY) {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    return openrouter("anthropic/claude-sonnet-4");
  }
  return anthropic(AI_CONFIG.MODEL);
}

export function runAgent({ messages, n8nBaseUrlEncrypted, n8nApiKeyEncrypted }: AgentInput) {
  const baseUrl = decrypt(n8nBaseUrlEncrypted);
  const apiKey = decrypt(n8nApiKeyEncrypted);
  const n8nClient = new N8nClient(baseUrl, apiKey);
  const tools = createN8nTools(n8nClient);

  return streamText({
    model: getModel(),
    system: AI_CONFIG.SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 5,
  });
}
