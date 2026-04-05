"use client";

import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, Bot, Edit2, Wifi, Key, Eye, EyeOff, Sparkles } from "lucide-react";

interface Credential {
  id: string;
  instance_name: string;
  is_active: boolean;
  last_health_check: string | null;
}

interface AISettings {
  id?: string;
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  systemPrompt?: string;
  maxTokens: number;
  maxSteps: number;
  temperature: number;
  isActive: boolean;
}

export default function SettingsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    instanceName: "",
    baseUrl: "",
    apiKey: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [telegramToken, setTelegramToken] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);

  const [aiSettings, setAISettings] = useState<AISettings | null>(null);
  const [aiForm, setAIForm] = useState<AISettings>({
    provider: "openrouter",
    apiKey: "",
    model: "anthropic/claude-sonnet-4.6",
    baseUrl: "",
    systemPrompt: "",
    maxTokens: 4096,
    maxSteps: 5,
    temperature: 0.3,
    isActive: true,
  });
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState("");
  const [aiSuccess, setAISuccess] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [testingAI, setTestingAI] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; response?: string; responseTime?: string } | null>(null);

  const loadCredentials = async () => {
    try {
      const res = await fetch("/api/credentials");
      const data = await res.json();
      console.log("Credentials response:", data);
      setCredentials(data.credentials || []);
    } catch (err) {
      console.error("Failed to load credentials:", err);
      setCredentials([]);
    }
  };

  useEffect(() => {
    loadCredentials();
    loadAISettings();
  }, []);

  const loadAISettings = async () => {
    try {
      const res = await fetch("/api/ai-settings");
      const data = await res.json();
      if (data.settings) {
        const settings = data.settings;
        setAISettings(settings);
        setAIForm({
          provider: settings.provider,
          apiKey: settings.api_key,
          model: settings.model,
          baseUrl: settings.base_url || "",
          systemPrompt: settings.system_prompt || "",
          maxTokens: settings.max_tokens,
          maxSteps: settings.max_steps,
          temperature: settings.temperature,
          isActive: settings.is_active,
        });
      }
    } catch (err) {
      console.error("Failed to load AI settings:", err);
    }
  };

  async function handleSaveAISettings(e: React.FormEvent) {
    e.preventDefault();
    setAILoading(true);
    setAIError("");
    setAISuccess("");

    try {
      const method = aiSettings ? "PUT" : "POST";
      const res = await fetch("/api/ai-settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: aiSettings?.id,
          provider: aiForm.provider,
          apiKey: aiForm.apiKey,
          model: aiForm.model,
          baseUrl: aiForm.baseUrl,
          systemPrompt: aiForm.systemPrompt,
          maxTokens: aiForm.maxTokens,
          maxSteps: aiForm.maxSteps,
          temperature: aiForm.temperature,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAIError(data.error || "Erro ao salvar configurações de IA");
        if (data.code === "MISSING_TABLE") {
          setAIError(data.error);
        }
        return;
      }

      setAISuccess("Configurações de IA salvas com sucesso!");
      setAISettings(data.settings);
      setShowAiConfig(false);
    } catch {
      setAIError("Erro ao salvar configurações de IA");
    } finally {
      setAILoading(false);
    }
  }

  async function handleTestAI() {
    setTestingAI(true);
    setTestLogs([]);
    setTestResult(null);
    setAIError("");

    try {
      const res = await fetch("/api/ai-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiForm.provider,
          apiKey: aiForm.apiKey,
          model: aiForm.model,
          baseUrl: aiForm.baseUrl,
          maxTokens: aiForm.maxTokens,
        }),
      });

      const data = await res.json();
      setTestLogs(data.logs || []);

      if (data.success) {
        setTestResult({ success: true, response: data.response, responseTime: data.responseTime });
      } else {
        setTestResult({ success: false });
        setAIError(data.error || "Falha no teste");
      }
    } catch (err) {
      setTestLogs((prev) => [...prev, `[ERRO] Falha na requisição: ${err instanceof Error ? err.message : String(err)}`]);
      setTestResult({ success: false });
      setAIError("Erro ao executar teste");
    } finally {
      setTestingAI(false);
    }
  }

  async function handleSubmitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar credenciais");
        console.error("Save error:", data);
        return;
      }

      setSuccess("Instância n8n conectada com sucesso!");
      setForm({ instanceName: "", baseUrl: "", apiKey: "" });
      setShowForm(false);

      const listRes = await fetch("/api/credentials");
      const listData = await listRes.json();
      setCredentials(listData.credentials || []);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleTestConnection(credential: Credential) {
    setTestingId(credential.id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", id: credential.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Conexão estabelecida com sucesso!");
      } else {
        setError(data.error || "Falha no teste de conexão");
      }

      const listRes = await fetch("/api/credentials");
      const listData = await listRes.json();
      setCredentials(listData.credentials);
    } catch {
      setError("Falha no teste de conexão");
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta instância?")) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Deleting credential ID:", id);
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });

      const data = await res.json();
      console.log("Delete response:", res.status, data);

      if (!res.ok) {
        setError(data.error ?? "Erro ao excluir");
        setLoading(false);
        return;
      }

      setSuccess("Instância excluída com sucesso!");
      
      // Reload credentials
      const listRes = await fetch("/api/credentials");
      const listData = await listRes.json();
      setCredentials(listData.credentials || []);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Erro ao excluir instância");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(cred: Credential) {
    setEditingId(cred.id);
    setForm({
      instanceName: cred.instance_name,
      baseUrl: "",
      apiKey: "",
    });
    setShowForm(true);
  }

  async function handleUpdateCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: editingId, ...form }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao atualizar");
        return;
      }

      setSuccess("Instância atualizada com sucesso!");
      setForm({ instanceName: "", baseUrl: "", apiKey: "" });
      setEditingId(null);
      setShowForm(false);

      const listRes = await fetch("/api/credentials");
      const listData = await listRes.json();
      setCredentials(listData.credentials);
    } catch {
      setError("Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p className="mt-1 text-muted-foreground">
        Gerencie suas conexões n8n e integrações
      </p>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Instâncias n8n</h2>
              <p className="text-sm text-muted-foreground">
                Suas credenciais são criptografadas com AES-256
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={editingId ? handleUpdateCredentials : handleSubmitCredentials}
            className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nome da Instância
              </label>
              <input
                type="text"
                value={form.instanceName}
                onChange={(e) =>
                  setForm({ ...form, instanceName: e.target.value })
                }
                placeholder="Meu n8n"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                URL do n8n
              </label>
              <input
                type="url"
                value={form.baseUrl}
                onChange={(e) =>
                  setForm({ ...form, baseUrl: e.target.value })
                }
                placeholder="https://seu-n8n.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Chave API
              </label>
              <input
                type="password"
                value={form.apiKey}
                onChange={(e) =>
                  setForm({ ...form, apiKey: e.target.value })
                }
                placeholder="Sua chave API do n8n"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Gere em: n8n Configurações &gt; API &gt; Criar Chave API
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Conectando..." : editingId ? "Atualizar" : "Conectar"}
              </button>
              {!editingId && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.baseUrl || !form.apiKey) {
                      setError("Preencha a URL e a Chave API para testar");
                      return;
                    }
                    setLoading(true);
                    setError("");
                    setSuccess("");
                    try {
                      const res = await fetch("/api/credentials", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "test",
                          baseUrl: form.baseUrl,
                          apiKey: form.apiKey,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setSuccess("Conexão estabelecida com sucesso!");
                      } else {
                        setError(data.error || "Falha no teste de conexão");
                      }
                    } catch {
                      setError("Falha no teste de conexão");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || !form.baseUrl || !form.apiKey}
                  className="flex items-center gap-2 rounded-lg border border-green-500/50 px-6 py-2 text-sm text-green-600 hover:bg-green-500/10 disabled:opacity-50"
                >
                  <Wifi className="h-4 w-4" />
                  Testar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ instanceName: "", baseUrl: "", apiKey: "" });
                }}
                className="rounded-lg border border-border px-6 py-2 text-sm hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 space-y-3">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{cred.instance_name}</p>
                <p className="text-xs text-muted-foreground">
                  Última verificação:{" "}
                  {cred.last_health_check
                    ? new Date(cred.last_health_check).toLocaleString("pt-BR")
                    : "Nunca"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    cred.is_active ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleTestConnection(cred)}
                  disabled={testingId === cred.id}
                  className="rounded-lg p-2 text-green-600 hover:bg-green-500/10 disabled:opacity-50"
                  title="Testar Conexão"
                >
                  <Wifi className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(cred)}
                  className="rounded-lg p-2 text-blue-600 hover:bg-blue-500/10"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cred.id)}
                  disabled={loading}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Bot className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-semibold">Bot Telegram</h2>
            <p className="text-sm text-muted-foreground">
              Conecte seu bot do Telegram para controlar o n8n via chat
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Token do Bot
            </label>
            <input
              type="password"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Obtenha o token do seu bot com @BotFather no Telegram
            </p>
          </div>
          <button
            disabled={telegramLoading || !telegramToken}
            className="mt-4 rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {telegramLoading ? "Salvando..." : "Salvar Token"}
          </button>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="font-semibold">Configuração do Agente de IA</h2>
              <p className="text-sm text-muted-foreground">
                Configure o provedor de IA, modelo e parâmetros do agente
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAiConfig(!showAiConfig)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Key className="h-4 w-4" />
            {showAiConfig ? "Cancelar" : "Configurar"}
          </button>
        </div>

        {aiError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {aiError}
          </div>
        )}

        {aiSuccess && (
          <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
            {aiSuccess}
          </div>
        )}

        {aiSettings && !showAiConfig && (
          <div className="mt-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Sparkles className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Agente de IA configurado</p>
                <p className="text-sm text-muted-foreground">
                  Provedor: {aiSettings.provider === "openrouter" ? "OpenRouter" : aiSettings.provider === "anthropic" ? "Anthropic" : aiSettings.provider === "openai" ? "OpenAI" : "Custom"} • Modelo: {aiSettings.model}
                </p>
              </div>
              <button
                onClick={() => setShowAiConfig(true)}
                className="ml-auto rounded-lg p-2 text-blue-600 hover:bg-blue-500/10"
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {!aiSettings && !showAiConfig && (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum agente de IA configurado. Clique em "Configurar" para começar.
            </p>
          </div>
        )}

        {showAiConfig && (
          <form onSubmit={handleSaveAISettings} className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6">
            <div>
              <label className="mb-1 block text-sm font-medium">Provedor</label>
              <select
                value={aiForm.provider}
                onChange={(e) =>
                  setAIForm({ ...aiForm, provider: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="openrouter">OpenRouter (Recomendado)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="openai">OpenAI</option>
                <option value="custom">Custom (OpenAI Compatible)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Chave API</label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={aiForm.apiKey}
                  onChange={(e) =>
                    setAIForm({ ...aiForm, apiKey: e.target.value })
                  }
                  placeholder="sk-..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Modelo</label>
              <input
                type="text"
                value={aiForm.model}
                onChange={(e) =>
                  setAIForm({ ...aiForm, model: e.target.value })
                }
                placeholder={aiForm.provider === "openrouter" ? "anthropic/claude-sonnet-4.6" : aiForm.provider === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {aiForm.provider === "openrouter"
                  ? "Ex: anthropic/claude-sonnet-4.6, openai/gpt-4o"
                  : aiForm.provider === "anthropic"
                  ? "Ex: claude-sonnet-4-20250514"
                  : aiForm.provider === "openai"
                  ? "Ex: gpt-4o, gpt-4o-mini"
                  : "URL do endpoint OpenAI compatible"}
              </p>
            </div>

            {aiForm.provider === "custom" && (
              <div>
                <label className="mb-1 block text-sm font-medium">Base URL</label>
                <input
                  type="url"
                  value={aiForm.baseUrl}
                  onChange={(e) =>
                    setAIForm({ ...aiForm, baseUrl: e.target.value })
                  }
                  placeholder="https://api.example.com/v1"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Prompt do Sistema (opcional)
              </label>
              <textarea
                value={aiForm.systemPrompt}
                onChange={(e) =>
                  setAIForm({ ...aiForm, systemPrompt: e.target.value })
                }
                placeholder="Deixe em branco para usar o prompt padrão do Agent007..."
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Max Tokens</label>
                <input
                  type="number"
                  value={aiForm.maxTokens}
                  onChange={(e) =>
                    setAIForm({ ...aiForm, maxTokens: parseInt(e.target.value) || 4096 })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Max Steps</label>
                <input
                  type="number"
                  value={aiForm.maxSteps}
                  onChange={(e) =>
                    setAIForm({ ...aiForm, maxSteps: parseInt(e.target.value) || 5 })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Temperatura</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={aiForm.temperature}
                  onChange={(e) =>
                    setAIForm({ ...aiForm, temperature: parseFloat(e.target.value) || 0.3 })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleTestAI}
                disabled={testingAI || !aiForm.apiKey || !aiForm.model}
                className="flex items-center gap-2 rounded-lg border border-green-500/50 px-6 py-2 text-sm text-green-600 hover:bg-green-500/10 disabled:opacity-50"
              >
                {testingAI ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4" />
                    Testar Conexão
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={aiLoading}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {aiLoading ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAiConfig(false);
                  setTestLogs([]);
                  setTestResult(null);
                }}
                className="rounded-lg border border-border px-6 py-2 text-sm hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>

            {(testLogs.length > 0 || testResult) && (
              <div className="mt-4 rounded-lg border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2">
                  {testResult?.success ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        Teste passou — {testResult.responseTime}
                      </span>
                      {testResult.response && (
                        <span className="text-xs text-muted-foreground">
                          Resposta: &quot;{testResult.response}&quot;
                        </span>
                      )}
                    </>
                  ) : testResult ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-red-600">
                        Teste falhou
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600">
                        Testando...
                      </span>
                    </>
                  )}
                </div>
                <div className="max-h-48 overflow-auto rounded bg-black/80 p-3 font-mono text-xs text-green-400">
                  {testLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
