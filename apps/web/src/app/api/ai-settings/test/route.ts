import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(request: Request) {
  const logs: string[] = [];
  const log = (msg: string) => {
    const ts = new Date().toISOString().split("T")[1].split(".")[0];
    logs.push(`[${ts}] ${msg}`);
    console.log(`[AI Test] ${msg}`);
  };

  try {
    const body = await request.json();
    const { provider, apiKey, model, baseUrl, maxTokens } = body;

    log("=== Teste de conexão com IA iniciado ===");
    log(`Provedor: ${provider}`);
    log(`Modelo: ${model}`);
    log(`API Key: ${apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : "NÃO INFORMADA"}`);

    if (!apiKey || !model) {
      log("ERRO: API key e modelo são obrigatórios");
      return NextResponse.json({
        success: false,
        logs,
        error: "API key e modelo são obrigatórios",
      }, { status: 400 });
    }

    let baseURL: string;
    switch (provider) {
      case "openrouter":
        baseURL = "https://openrouter.ai/api/v1";
        log(`Base URL: ${baseURL} (OpenRouter)`);
        break;
      case "anthropic":
        baseURL = "https://api.anthropic.com/v1";
        log(`Base URL: ${baseURL} (Anthropic)`);
        break;
      case "openai":
        baseURL = "https://api.openai.com/v1";
        log(`Base URL: ${baseURL} (OpenAI)`);
        break;
      case "custom":
        baseURL = baseUrl || "https://api.openai.com/v1";
        log(`Base URL: ${baseURL} (Custom)`);
        break;
      default:
        baseURL = "https://openrouter.ai/api/v1";
        log(`Base URL: ${baseURL} (default fallback)`);
    }

    log("Criando cliente OpenAI compatible...");
    const aiProvider = createOpenAI({
      baseURL,
      apiKey,
    });

    const aiModel = aiProvider(model);
    log(`Modelo configurado: ${model}`);

    log("Enviando requisição de teste para a IA...");
    const t0 = Date.now();

    try {
      const result = streamText({
        model: aiModel,
        messages: [
          { role: "user", content: "Responda apenas com 'OK' se estiver funcionando." },
        ],
        maxTokens: 20,
      });

      const textChunks: string[] = [];
      for await (const chunk of result.textStream) {
        textChunks.push(chunk);
      }

      const elapsed = Date.now() - t0;
      const fullText = textChunks.join("");

      log(`Resposta recebida em ${elapsed}ms`);
      log(`Conteúdo: "${fullText}"`);
      log("=== Teste concluído com SUCESSO ===");

      return NextResponse.json({
        success: true,
        logs,
        response: fullText,
        responseTime: `${elapsed}ms`,
      });
    } catch (apiErr: unknown) {
      const elapsed = Date.now() - t0;
      const errMsg = apiErr instanceof Error ? apiErr.message : String(apiErr);
      log(`ERRO na requisição (${elapsed}ms): ${errMsg}`);

      if (errMsg.includes("401") || errMsg.toLowerCase().includes("unauthorized") || errMsg.toLowerCase().includes("api key")) {
        log("DICA: Verifique se a API key está correta e tem créditos/saldo");
      } else if (errMsg.includes("403") || errMsg.toLowerCase().includes("forbidden")) {
        log("DICA: A API key pode não ter permissão para este modelo");
      } else if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
        log("DICA: O modelo não existe ou está incorreto");
      } else if (errMsg.includes("429") || errMsg.toLowerCase().includes("rate limit") || errMsg.toLowerCase().includes("quota")) {
        log("DICA: Limite de requisições ou quota excedido");
      }

      log("=== Teste concluído com FALHA ===");

      return NextResponse.json({
        success: false,
        logs,
        error: errMsg,
      });
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    log(`ERRO CRÍTICO: ${errMsg}`);
    log("=== Teste concluído com FALHA ===");

    return NextResponse.json({
      success: false,
      logs,
      error: errMsg,
    }, { status: 500 });
  }
}
