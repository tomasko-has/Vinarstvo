import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Hex hodnoty zodpovedajú tokenom vapno (pozadie) a frankovka (téma) z app/globals.css;
// manifest nepozná CSS premenné.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: site.shortName,
    description: `Mapa a audio sprievodca ${site.laneIn}, vína a degustácie. Funguje aj bez signálu.`,
    lang: "sk",
    start_url: "/mapa",
    scope: "/",
    display: "standalone",
    background_color: "#f1f2ec",
    theme_color: "#5b1a33",
    categories: ["travel", "food", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Mapa uličky", url: "/mapa", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Audio sprievodca", url: "/sprievodca", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
