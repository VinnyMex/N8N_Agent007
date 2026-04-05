import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent007 - Agente IA para n8n",
  description:
    "Controle seus workflows do n8n com um agente de IA. Chat no aplicativo ou via bot do Telegram.",
  keywords: ["n8n", "automação", "workflow", "agente IA", "telegram", "bot"],
  authors: [{ name: "Agent007" }],
  robots: "noindex, nofollow",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Agent007",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
