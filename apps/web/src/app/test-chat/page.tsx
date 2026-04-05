"use client";

import { useChat } from "ai/react";
import { Bot, Send, User, FlaskConical, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface TestResult {
  summary: string;
  totalTime: string;
  ready: boolean;
  tests: Record<string, { status: string; detail?: string; time?: string }>;
}

export default function TestChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({ api: "/api/test-standalone" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function runTests() {
    setTestLoading(true);
    try {
      const res = await fetch("/api/test-standalone");
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      setTestResults({ summary: "Falha ao executar testes", totalTime: "0ms", ready: false, tests: {} });
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-80 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <FlaskConical className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold">Modo Teste</span>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <button
            onClick={runTests}
            disabled={testLoading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {testLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Executando...
              </span>
            ) : (
              "Executar Testes"
            )}
          </button>

          {testResults && (
            <div className="mt-4 space-y-3">
              <div className={`rounded-xl p-4 text-center ${testResults.ready ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
                <p className={`text-lg font-bold ${testResults.ready ? "text-green-500" : "text-red-500"}`}>
                  {testResults.summary}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {testResults.totalTime}
                </p>
              </div>

              {Object.entries(testResults.tests).map(([key, test]) => (
                <div
                  key={key}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-center gap-2">
                    {test.status === "PASS" ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {key.replace(/^\d+_/, "").replace(/_/g, " ")}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {test.time}
                    </span>
                  </div>
                  {test.detail && (
                    <p className="mt-1 text-xs text-muted-foreground pl-6">
                      {test.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <h3 className="text-sm font-semibold mb-2">Comandos Rápidos</h3>
            <div className="space-y-2">
              {[
                "Listar meus workflows",
                "Mostrar execuções falhadas",
                "Ativar workflow wf_003",
                "Executar Relatório Diário",
                "Verificar saúde do n8n",
                "Quais workflows estão executando?",
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    handleInputChange({
                      target: { value: cmd },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  className="block w-full rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-secondary transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Agent007 Chat de Teste</h1>
            <span className="rounded-full bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-xs text-yellow-600">
              Modo Simulação
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Agente de IA com dados simulados do n8n. Sem necessidade de Supabase.
          </p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Agent007 Modo Teste</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Este é um teste autônomo usando dados simulados do n8n.
                O agente de IA (Claude) usará tool calling para interagir com workflows simulados.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Experimente: &quot;Listar meus workflows&quot; ou &quot;Mostrar execuções falhadas&quot;
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "assistant" && (
                <div className="shrink-0 rounded-lg bg-primary/10 p-2 h-fit">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="shrink-0 rounded-lg bg-secondary p-2 h-fit">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="shrink-0 rounded-lg bg-primary/10 p-2 h-fit">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error.message}
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Pergunte sobre seus workflows n8n (dados simulados)..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
