import type { Metadata } from "next";
import "./globals.css";
import { OrganizationProvider } from "../lib/tenant/context";

export const metadata: Metadata = {
  title: "Gabinete 360° | Gestão Integrada de Mandato",
  description: "SaaS Multi-tenant para Gabinetes Parlamentares e Câmaras Municipais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-paper text-ink font-body">
        <OrganizationProvider>
          {children}
        </OrganizationProvider>
      </body>
    </html>
  );
}
