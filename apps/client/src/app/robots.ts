import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gabinete360.com.br";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/portal", "/portal/*", "/validar-assinatura", "/privacidade"],
      disallow: [
        "/api/*",
        "/dashboard",
        "/demandas",
        "/cidadaos",
        "/agenda",
        "/legislativo",
        "/configuracoes",
        "/equipe",
        "/whatsapp",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
