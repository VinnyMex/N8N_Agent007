"use client";

import { useChat } from "ai/react";
import { Bot, Send, User, Settings2, Sparkles } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface AISettings {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  systemPrompt?: string;
  maxTokens: number;
  maxSteps: number;
  temperature: number;
}

export default function ChatPage() {
  const [aiSettings, setAISettings] = useState<AISettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/test-standalone",
      body: aiSettings ? { aiSettings } : {},
    });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetch("/api/ai-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setAISettings({
            provider: data.settings.provider,
            apiKey: data.settings.api_key,
            model: data.settings.model,
            baseUrl: data.settings.base_url,
            systemPrompt: data.settings.system_prompt,
            maxTokens: data.settings.max_tokens,
            maxSteps: data.settings.max_steps,
            temperature: data.settings.temperature,
          });
        }
        setSettingsLoaded(true);
      })
      .catch(() => setSettingsLoaded(true));
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Chat do Agente IA</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus workflows n8n através de conversa natural
            </p>
          </div>
          {settingsLoaded && (
            <div className="flex items-center gap-2">
              {aiSettings ? (
                <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/30 px-3 py-1 text-xs text-green-600">
                  <Sparkles className="h-3 w-3" />
                  {aiSettings.model}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs text-yellow-600">
                  <Settings2 className="h-3 w-3" />
                  Usando padrão
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-2xl bg-primary/10 p-4">
              <Bot className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Agent007 Pronto</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Pergunte qualquer coisa sobre seus workflows n8n. Posso listar, ativar,
              executar e depurar para você.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Listar meus workflows",
                "Mostrar execuções falhadas",
                "Verificar saúde do n8n",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    handleInputChange({
                      target: { value: suggestion },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "justify-end" : ""
            }`}
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
            placeholder="Pergunte sobre seus workflows n8n..."
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
  );
}
