import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { OrganizationProvider } from "../lib/tenant/context";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gabinete360.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gabinete Digital 360° | Gestão Integrada de Mandato",
    template: "%s | Gabinete Digital 360°",
  },
  description:
    "SaaS Multi-tenant para Gabinetes Parlamentares e Câmaras Municipais. Gestão territorial, legislativa, CRM de cidadãos e inteligência política.",
  keywords: [
    "Gabinete 360",
    "Gabinete Digital",
    "Gestão Parlamentar",
    "Câmara Municipal",
    "Vereador",
    "Mandato Digital",
    "CRM Político",
    "Inteligência Artificial Parlamentar",
  ],
  authors: [{ name: "DM IA Studio" }],
  creator: "DM IA Studio",
  publisher: "DM IA Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Gabinete Digital 360° | Mandato Parlamentar de Alta Performance",
    description:
      "Plataforma completa de governança e mandato participativo: CRM de cidadãos, proposições legislativas, despacho por WhatsApp e transparência pública.",
    url: siteUrl,
    siteName: "Gabinete Digital 360°",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Gabinete Digital 360° - Brasão Parlamentar",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabinete Digital 360° | Gestão de Mandato",
    description:
      "Gestão legislativa, CRM de cidadãos e IA para vereadores e câmaras municipais.",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0284c7" />
      </head>
      <body className="antialiased min-h-screen bg-paper text-ink font-body">
        <OrganizationProvider>
          {children}
        </OrganizationProvider>
        <Analytics />
      </body>
    </html>
  );
}
