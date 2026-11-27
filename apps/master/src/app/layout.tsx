import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { MasterAdminProvider } from "../lib/auth/context";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gabinete360.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gabinete 360° | Painel Master (Control Plane)",
    template: "%s | Painel Master 360°",
  },
  description: "Plataforma de Gestão Multi-Tenant e Control Plane por DM IA Studio",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="antialiased min-h-screen bg-paper text-ink font-body">
        <MasterAdminProvider>
          {children}
        </MasterAdminProvider>
        <Analytics />
      </body>
    </html>
  );
}
