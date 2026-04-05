import { NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { AI_CONFIG } from "@/lib/shared";
import { N8nClient } from "@/lib/n8n-client";
import { createN8nTools } from "@/lib/ai/tools";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

function getRealN8nClient(): N8nClient {
  const baseUrl = process.env.N8N_BASE_URL;
  const apiKey = process.env.N8N_API_KEY;
  console.log("N8N_BASE_URL:", baseUrl);
  console.log("N8N_API_KEY exists:", !!apiKey);
  
  if (!baseUrl || !apiKey) {
    throw new Error("N8N_BASE_URL and N8N_API_KEY must be configured");
  }
  return new N8nClient(baseUrl, apiKey);
}

export async function GET() {
  const results: Record<string, { status: string; detail?: string; time?: string }> = {};
  const startTotal = Date.now();

  const t1 = Date.now();
  try {
    const testData = `${process.env.N8N_BASE_URL}|${process.env.N8N_API_KEY}`;
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    results["1_encryption"] = {
      status: decrypted === testData ? "PASS" : "FAIL",
      detail: decrypted === testData ? `AES-256-GCM OK` : "Mismatch",
      time: `${Date.now() - t1}ms`,
    };
  } catch (err) {
    results["1_encryption"] = { status: "FAIL", detail: String(err), time: `${Date.now() - t1}ms` };
  }

  const t2 = Date.now();
  try {
    const n8nUrl = process.env.N8N_BASE_URL!;
    const n8nKey = process.env.N8N_API_KEY!;
    const encUrl = encrypt(n8nUrl);
    const encKey = encrypt(n8nKey);
    const decUrl = decrypt(encUrl);
    const decKey = decrypt(encKey);
    results["2_credential_flow"] = {
      status: decUrl === n8nUrl && decKey === n8nKey ? "PASS" : "FAIL",
      detail: `URL: ${n8nUrl.slice(0, 20)}...`,
      time: `${Date.now() - t2}ms`,
    };
  } catch (err) {
    results["2_credential_flow"] = { status: "FAIL", detail: String(err), time: `${Date.now() - t2}ms` };
  }

  const t4 = Date.now();
  try {
    const client = getRealN8nClient();
    const healthy = await client.healthCheck();
    if (healthy) {
      const { data: workflows } = await client.getWorkflows();
      results["4_n8n_connection"] = {
        status: "PASS",
        detail: `Found ${workflows.length} workflows`,
        time: `${Date.now() - t4}ms`,
      };
    } else {
      results["4_n8n_connection"] = { status: "FAIL", detail: "Cannot reach n8n", time: `${Date.now() - t4}ms` };
    }
  } catch (err) {
    results["4_n8n_connection"] = { status: "FAIL", detail: String(err), time: `${Date.now() - t4}ms` };
  }

  const t6 = Date.now();
  const hasKey = !!process.env.OPENROUTER_API_KEY;
  results["6_openrouter_key"] = {
    status: hasKey ? "PASS" : "FAIL",
    detail: hasKey ? `Key set` : "Missing",
    time: `${Date.now() - t6}ms`,
  };

  const totalPassing = Object.values(results).filter(r => r.status === "PASS").length;
  return NextResponse.json({
    summary: `${totalPassing}/${Object.keys(results).length} tests passing`,
    totalTime: `${Date.now() - startTotal}ms`,
    ready: totalPassing === Object.keys(results).length,
    tests: results,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = body.message ?? body.messages?.[body.messages?.length - 1]?.content ?? "hello";
    const aiSettings = body.aiSettings;

    console.log("=== POST test-standalone ===");
    console.log("userMessage:", userMessage);
    console.log("aiSettings:", aiSettings ? `${aiSettings.provider}/${aiSettings.model}` : "using env defaults");

    const n8nClient = getRealN8nClient();
    console.log("n8nClient created");

    const tools = createN8nTools(n8nClient);
    console.log("tools created:", Object.keys(tools).length);

    let model;
    let systemPrompt = AI_CONFIG.SYSTEM_PROMPT;
    let maxSteps = 5;
    let maxTokens = 4096;

    if (aiSettings && aiSettings.apiKey && aiSettings.model) {
      let baseURL: string;
      switch (aiSettings.provider) {
        case "openrouter":
          baseURL = "https://openrouter.ai/api/v1";
          break;
        case "anthropic":
          baseURL = "https://api.anthropic.com/v1";
          break;
        case "openai":
          baseURL = "https://api.openai.com/v1";
          break;
        case "custom":
          baseURL = aiSettings.baseUrl || "https://api.openai.com/v1";
          break;
        default:
          baseURL = "https://openrouter.ai/api/v1";
      }

      const provider = createOpenAI({
        baseURL,
        apiKey: aiSettings.apiKey,
      });
      model = provider(aiSettings.model);
      systemPrompt = aiSettings.systemPrompt || AI_CONFIG.SYSTEM_PROMPT;
      maxSteps = aiSettings.maxSteps ?? 5;
      maxTokens = aiSettings.maxTokens ?? 4096;
    } else {
      model = openrouter("anthropic/claude-sonnet-4.6");
    }

    const result = streamText({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      tools,
      maxSteps,
      maxTokens,
    });

    console.log("streamText result created");
    return result.toDataStreamResponse();
  } catch (err: any) {
    console.error("=== POST ERROR ===");
    console.error(err);
    console.error(err.stack);
    return NextResponse.json({ 
      error: err.message || String(err),
      stack: err.stack 
    }, { status: 500 });
  }
}
