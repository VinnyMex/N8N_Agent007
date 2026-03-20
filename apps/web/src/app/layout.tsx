import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent007 - AI Agent for n8n",
  description:
    "Control your n8n workflows with an AI agent. Chat in-app or via Telegram bot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
