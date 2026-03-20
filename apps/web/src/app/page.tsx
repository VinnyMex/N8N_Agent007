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
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Agent007</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
            Control your{" "}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              n8n workflows
            </span>{" "}
            with AI
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            An intelligent agent that manages your n8n automation instance.
            Chat in-app or via Telegram bot. Monitor, execute, and troubleshoot
            workflows with natural language.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
            >
              Start Free <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-lg font-semibold hover:bg-secondary transition-colors"
            >
              See How it Works
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. 20 free messages/day.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Everything you need to manage n8n
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Your AI-powered control center for workflow automation
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Bot,
                title: "AI Agent",
                description:
                  "Natural language interface to control your n8n. List, activate, execute, and debug workflows just by chatting.",
              },
              {
                icon: MessageSquare,
                title: "Telegram Bot",
                description:
                  "Control your n8n from anywhere via Telegram. Get instant notifications and manage workflows on the go.",
              },
              {
                icon: Activity,
                title: "Real-time Monitoring",
                description:
                  "Live dashboard showing workflow execution status. See successes, failures, and running workflows instantly.",
              },
              {
                icon: Bell,
                title: "Smart Alerts",
                description:
                  "Push notifications and Telegram alerts when workflows fail. Never miss a critical error.",
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                description:
                  "AES-256 encryption for all credentials. Your n8n API keys are encrypted at rest and in transit.",
              },
              {
                icon: Zap,
                title: "MCP Protocol",
                description:
                  "Built on Model Context Protocol for native AI-to-n8n communication. Fast, reliable, and extensible.",
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

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Up and running in 3 steps
            </h2>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect your n8n",
                description:
                  "Add your n8n instance URL and API key. We encrypt everything with AES-256.",
              },
              {
                step: "02",
                title: "Chat with your Agent",
                description:
                  "Ask anything: 'Show my failed workflows', 'Activate workflow X', 'Run my daily report'.",
              },
              {
                step: "03",
                title: "Monitor & Automate",
                description:
                  "Get real-time alerts on failures, auto-retry, and smart suggestions to fix issues.",
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                description: "For personal projects",
                features: [
                  "20 AI messages/day",
                  "1 n8n instance",
                  "5 workflows monitored",
                  "In-app chat",
                  "Community support",
                ],
                cta: "Get Started",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$19",
                description: "For professionals",
                features: [
                  "500 AI messages/day",
                  "5 n8n instances",
                  "50 workflows monitored",
                  "Telegram bot integration",
                  "Push notifications",
                  "Priority support",
                ],
                cta: "Start Pro Trial",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "$99",
                description: "For teams & agencies",
                features: [
                  "Unlimited AI messages",
                  "Unlimited n8n instances",
                  "Unlimited workflows",
                  "Telegram + Slack bots",
                  "Custom MCP tools",
                  "SLA & dedicated support",
                  "SSO & audit logs",
                ],
                cta: "Contact Sales",
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
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
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

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold">Agent007</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Documentation
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Agent007. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
