import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { MasterAdminProvider } from "../lib/auth/context";

export const metadata: Metadata = {
  title: "Gabinete 360° | Painel Master (Control Plane)",
  description: "Plataforma de Gestão Multi-Tenant e Control Plane por DM IA Studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-paper text-ink font-body">
        <MasterAdminProvider>
          {children}
        </MasterAdminProvider>
        <Analytics />
      </body>
    </html>
  );
}
