import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { AI_CONFIG } from "shared";
import { N8nClient } from "@/lib/n8n-client";
import { createN8nTools } from "./tools";
import { decrypt } from "@/lib/encryption";

interface AgentInput {
  messages: { role: "user" | "assistant"; content: string }[];
  n8nBaseUrlEncrypted?: string;
  n8nApiKeyEncrypted?: string;
}

function getModel() {
  if (process.env.OPENROUTER_API_KEY) {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    return openrouter("anthropic/claude-sonnet-4.6");
  }
  
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Nenhuma API de IA configurada. Configure ANTHROPIC_API_KEY ou OPENROUTER_API_KEY");
  }
  
  return anthropic(AI_CONFIG.MODEL);
}

export function runAgent({ messages, n8nBaseUrlEncrypted, n8nApiKeyEncrypted }: AgentInput) {
  let baseUrl: string;
  let apiKey: string;
  
  // Try to use encrypted credentials from DB, fallback to env vars
  if (n8nBaseUrlEncrypted && n8nApiKeyEncrypted) {
    try {
      baseUrl = decrypt(n8nBaseUrlEncrypted);
      apiKey = decrypt(n8nApiKeyEncrypted);
    } catch (e) {
      console.error("Decrypt error, using env vars:", e);
      baseUrl = process.env.N8N_BASE_URL || "";
      apiKey = process.env.N8N_API_KEY || "";
    }
  } else {
    baseUrl = process.env.N8N_BASE_URL || "";
    apiKey = process.env.N8N_API_KEY || "";
  }
  
  if (!baseUrl || !apiKey) {
    throw new Error("Credenciais n8n não configuradas");
  }
  
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
