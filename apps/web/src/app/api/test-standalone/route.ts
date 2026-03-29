import { NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { AI_CONFIG } from "shared";
import { N8nClient } from "@/lib/n8n-client";
import { createN8nTools } from "@/lib/ai/tools";

// Standalone test endpoint - bypasses Supabase auth
// Uses REAL n8n instance + REAL AI (OpenRouter)
// DELETE THIS FILE BEFORE PRODUCTION

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

function getRealN8nClient(): N8nClient {
  const baseUrl = process.env.N8N_BASE_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("N8N_BASE_URL and N8N_API_KEY must be configured");
  }
  return new N8nClient(baseUrl, apiKey);
}

// GET - Run integration tests against real services
export async function GET() {
  const results: Record<string, { status: string; detail?: string; time?: string }> = {};
  const startTotal = Date.now();

  // Test 1: AES-256 Encryption round-trip
  const t1 = Date.now();
  try {
    const testData = `${process.env.N8N_BASE_URL}|${process.env.N8N_API_KEY}`;
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    results["1_encryption"] = {
      status: decrypted === testData ? "PASS" : "FAIL",
      detail: decrypted === testData
        ? `AES-256-GCM OK. Encrypted ${testData.length} chars -> ${encrypted.length} chars`
        : "Mismatch after decrypt",
      time: `${Date.now() - t1}ms`,
    };
  } catch (err) {
    results["1_encryption"] = { status: "FAIL", detail: String(err), time: `${Date.now() - t1}ms` };
  }

  // Test 2: Encrypt + decrypt n8n credentials (simulating DB flow)
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
      detail: `Credential encrypt->store->decrypt flow working. URL: ${n8nUrl.slice(0, 30)}...`,
      time: `${Date.now() - t2}ms`,
    };
  } catch (err) {
    results["2_credential_flow"] = { status: "FAIL", detail: String(err), time: `${Date.now() - t2}ms` };
  }

  // Test 3: Shared package (validators, constants)
  const t3 = Date.now();
  try {
    const { AI_CONFIG, PLAN_LIMITS, RATE_LIMIT, n8nCredentialSchema } = await import("shared");
    const validCred = n8nCredentialSchema.safeParse({
      instanceName: "Prod n8n",
      baseUrl: "https://n8n.vinfomkt.fun",
      apiKey: "test",
    });
    results["3_shared_package"] = {
      status: !!AI_CONFIG.MODEL && !!PLAN_LIMITS.free && validCred.success ? "PASS" : "FAIL",
      detail: `Model: ${AI_CONFIG.MODEL}, Rate: ${RATE_LIMIT.AI_REQUESTS_PER_MINUTE}/min, Validators: OK`,
      time: `${Date.now() - t3}ms`,
    };
  } catch (err) {
    results["3_shared_package"] = { status: "FAIL", detail: String(err), time: `${Date.now() - t3}ms` };
  }

  // Test 4: Real n8n connection
  const t4 = Date.now();
  try {
    const client = getRealN8nClient();
    const healthy = await client.healthCheck();
    if (healthy) {
      const { data: workflows } = await client.getWorkflows();
      results["4_n8n_connection"] = {
        status: "PASS",
        detail: `Connected to ${process.env.N8N_BASE_URL}. Found ${workflows.length} real workflows.`,
        time: `${Date.now() - t4}ms`,
      };
    } else {
      results["4_n8n_connection"] = {
        status: "FAIL",
        detail: `Cannot reach ${process.env.N8N_BASE_URL}`,
        time: `${Date.now() - t4}ms`,
      };
    }
  } catch (err) {
    results["4_n8n_connection"] = {
      status: "FAIL",
      detail: `n8n unreachable: ${err instanceof Error ? err.message : String(err)}`,
      time: `${Date.now() - t4}ms`,
    };
  }

  // Test 5: Real n8n tools (tool definitions)
  const t5 = Date.now();
  try {
    const client = getRealN8nClient();
    const tools = createN8nTools(client);
    const toolNames = Object.keys(tools);
    results["5_n8n_tools"] = {
      status: toolNames.length >= 7 ? "PASS" : "FAIL",
      detail: `${toolNames.length} tools registered: ${toolNames.join(", ")}`,
      time: `${Date.now() - t5}ms`,
    };
  } catch (err) {
    results["5_n8n_tools"] = { status: "FAIL", detail: String(err), time: `${Date.now() - t5}ms` };
  }

  // Test 6: OpenRouter API key
  const t6 = Date.now();
  try {
    const hasKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith("sk-or-");
    results["6_openrouter_key"] = {
      status: hasKey ? "PASS" : "FAIL",
      detail: hasKey
        ? `OpenRouter key configured (${process.env.OPENROUTER_API_KEY!.slice(0, 12)}...)`
        : "Missing OPENROUTER_API_KEY",
      time: `${Date.now() - t6}ms`,
    };
  } catch (err) {
    results["6_openrouter_key"] = { status: "FAIL", detail: String(err), time: `${Date.now() - t6}ms` };
  }

  // Test 7: All environment variables
  const t7 = Date.now();
  const envCheck = {
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 64,
    N8N_BASE_URL: !!process.env.N8N_BASE_URL,
    N8N_API_KEY: !!process.env.N8N_API_KEY,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
  };
  const envPassing = Object.values(envCheck).filter(Boolean).length;
  results["7_environment"] = {
    status: envPassing === Object.keys(envCheck).length ? "PASS" : "FAIL",
    detail: `${envPassing}/${Object.keys(envCheck).length}: ${JSON.stringify(envCheck)}`,
    time: `${Date.now() - t7}ms`,
  };

  const totalPassing = Object.values(results).filter(r => r.status === "PASS").length;
  const totalTests = Object.keys(results).length;

  return NextResponse.json({
    summary: `${totalPassing}/${totalTests} tests passing`,
    totalTime: `${Date.now() - startTotal}ms`,
    ready: totalPassing === totalTests,
    tests: results,
  }, { status: totalPassing === totalTests ? 200 : 500 });
}

// POST - Real AI agent chat (OpenRouter + real n8n tools)
export async function POST(request: Request) {
  const body = await request.json();
  const userMessage = body.message ?? body.messages?.[body.messages?.length - 1]?.content ?? "List my workflows";

  const messages = [{ role: "user" as const, content: userMessage }];

  // Use real n8n client with real credentials
  const n8nClient = getRealN8nClient();
  const tools = createN8nTools(n8nClient);

  const result = streamText({
    model: openrouter("anthropic/claude-sonnet-4"),
    system: AI_CONFIG.SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
