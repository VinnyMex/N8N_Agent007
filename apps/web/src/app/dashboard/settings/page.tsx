"use client";

import { useState } from "react";
import { Shield, Plus, Trash2, Bot } from "lucide-react";

interface Credential {
  id: string;
  instance_name: string;
  is_active: boolean;
  last_health_check: string | null;
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

  // Telegram config
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);

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

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save credentials");
        return;
      }

      setSuccess("n8n instance connected successfully!");
      setForm({ instanceName: "", baseUrl: "", apiKey: "" });
      setShowForm(false);

      // Refresh credentials
      const listRes = await fetch("/api/credentials");
      const listData = await listRes.json();
      setCredentials(listData.credentials);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your n8n connections and integrations
      </p>

      {/* n8n Credentials */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">n8n Instances</h2>
              <p className="text-sm text-muted-foreground">
                Your credentials are encrypted with AES-256
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Instance
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
            onSubmit={handleSubmitCredentials}
            className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Instance Name
              </label>
              <input
                type="text"
                value={form.instanceName}
                onChange={(e) =>
                  setForm({ ...form, instanceName: e.target.value })
                }
                placeholder="My n8n"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                n8n URL
              </label>
              <input
                type="url"
                value={form.baseUrl}
                onChange={(e) =>
                  setForm({ ...form, baseUrl: e.target.value })
                }
                placeholder="https://your-n8n.example.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                API Key
              </label>
              <input
                type="password"
                value={form.apiKey}
                onChange={(e) =>
                  setForm({ ...form, apiKey: e.target.value })
                }
                placeholder="Your n8n API key"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Generate at: n8n Settings &gt; API &gt; Create API Key
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect & Save"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-6 py-2 text-sm hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Saved Credentials */}
        <div className="mt-4 space-y-3">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{cred.instance_name}</p>
                <p className="text-xs text-muted-foreground">
                  Last checked:{" "}
                  {cred.last_health_check
                    ? new Date(cred.last_health_check).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    cred.is_active ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Telegram Integration */}
      <section className="mt-12">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Bot className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-semibold">Telegram Bot</h2>
            <p className="text-sm text-muted-foreground">
              Connect your Telegram bot to control n8n via chat
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Bot Token
            </label>
            <input
              type="password"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Get your bot token from @BotFather on Telegram
            </p>
          </div>
          <button
            disabled={telegramLoading || !telegramToken}
            className="mt-4 rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {telegramLoading ? "Saving..." : "Save Bot Token"}
          </button>
        </div>
      </section>
    </div>
  );
}
