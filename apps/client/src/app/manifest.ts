import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gabinete Digital 360° | Mandato Parlamentar",
    short_name: "Gabinete 360°",
    description: "SaaS de Gestão Integrada de Mandato Parlamentar e Câmaras Municipais",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0284c7",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
