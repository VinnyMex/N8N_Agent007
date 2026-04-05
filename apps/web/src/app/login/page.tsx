"use client";

import { Bot, Mail, Eye, EyeOff, UserCircle } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowser();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setMessage("Verifique seu email para confirmar sua conta, ou simplesmente faça login se a confirmação de email estiver desabilitada.");
        setLoading(false);
      }
    }
  }

  async function handleAnonymousLogin() {
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Bem-vindo ao Agent007</h1>
          <p className="mt-2 text-muted-foreground">
            Entre para gerenciar seu n8n com IA
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
            {message}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {loading
              ? "Carregando..."
              : mode === "login"
                ? "Entrar com Email"
                : "Criar Conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
            setMessage("");
          }}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "login"
            ? "Não tem uma conta? Cadastre-se"
            : "Já tem uma conta? Entre"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <button
          onClick={handleAnonymousLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 py-3.5 font-medium transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <UserCircle className="h-5 w-5" />
          {loading ? "Carregando..." : "Continuar como Visitante"}
        </button>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 py-3.5 font-medium transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? "Redirecionando..." : "Continuar com Google"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
