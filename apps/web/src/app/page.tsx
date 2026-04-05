import Link from "next/link";
import {
  Bot,
  Zap,
  Shield,
  MessageSquare,
  Activity,
  Bell,
  ChevronRight,
  Check,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Agent007</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span>Powered by AI + Model Context Protocol</span>
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Controle seus{" "}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              workflows n8n
            </span>{" "}
            com IA
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Um agente inteligente que gerencia sua instância de automação n8n.
            converse no aplicativo ou via bot do Telegram. Monitore, execute e solucione
            problemas com linguagem natural.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
            >
              Começar Grátis <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-lg font-semibold hover:bg-secondary transition-colors"
            >
              Veja Como Funciona
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Sem cartão de crédito. 20 mensagens grátis/dia.
          </p>
        </div>
      </section>

      <section id="features" className="py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Tudo que você precisa para gerenciar n8n
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Seu centro de controle com IA para automação de workflows
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Bot,
                title: "Agente de IA",
                description:
                  "Interface em linguagem natural para controlar seu n8n. Liste, ative, execute e depure workflows apenas conversando.",
              },
              {
                icon: MessageSquare,
                title: "Bot Telegram",
                description:
                  "Controle seu n8n de qualquer lugar via Telegram. Receba notificações instantâneas e gerencie workflows em qualquer lugar.",
              },
              {
                icon: Activity,
                title: "Monitoramento em Tempo Real",
                description:
                  "Dashboard ao vivo mostrando status de execução de workflows. Veja sucessos, falhas e workflows em execução instantaneamente.",
              },
              {
                icon: Bell,
                title: "Alertas Inteligentes",
                description:
                  "Notificações push e alertas via Telegram quando workflows falharem. Nunca perca um erro crítico.",
              },
              {
                icon: Shield,
                title: "Segurança Bancária",
                description:
                  "Criptografia AES-256 para todas as credenciais. Suas chaves API do n8n são criptografadas em repouso e em trânsito.",
              },
              {
                icon: Zap,
                title: "Protocolo MCP",
                description:
                  "Construído sobre o Model Context Protocol para comunicação nativa IA-para-n8n. Rápido, confiável e extensível.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Pronto em 3 passos
            </h2>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Conecte seu n8n",
                description:
                  "Adicione a URL e chave API da sua instância n8n. Criptografamos tudo com AES-256.",
              },
              {
                step: "02",
                title: "Converse com seu Agente",
                description:
                  "Pergunte qualquer coisa: 'Mostre meus workflows falhos', 'Ative o workflow X', 'Execute meu relatório diário'.",
              },
              {
                step: "03",
                title: "Monitore e Automatize",
                description:
                  "Receba alertas em tempo real sobre falhas, retry automático e sugestões inteligentes para resolver problemas.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Preços simples e transparentes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comece grátis, upgrade quando precisar
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Grátis",
                price: "R$0",
                description: "Para projetos pessoais",
                features: [
                  "20 mensagens IA/dia",
                  "1 instância n8n",
                  "5 workflows monitorados",
                  "Chat no aplicativo",
                  "Suporte da comunidade",
                ],
                cta: "Começar Grátis",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "R$49",
                description: "Para profissionais",
                features: [
                  "500 mensagens IA/dia",
                  "5 instâncias n8n",
                  "50 workflows monitorados",
                  "Integração bot Telegram",
                  "Notificações push",
                  "Suporte prioritário",
                ],
                cta: "Testar Pro",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "R$199",
                description: "Para equipes e agências",
                features: [
                  "Mensagens IA ilimitadas",
                  "Instâncias n8n ilimitadas",
                  "Workflows ilimitados",
                  "Bots Telegram + Slack",
                  "Ferramentas MCP customizadas",
                  "SLA e suporte dedicado",
                  "SSO e logs de auditoria",
                ],
                cta: "Falar com Vendas",
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-primary bg-card shadow-xl scale-105"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    <Star className="mr-1 inline h-3.5 w-3.5" />
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-8 block rounded-xl py-3 text-center font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold">Agent007</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Termos de Serviço
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Documentação
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Agent007. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
