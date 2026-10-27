// Popisky a hodnoty enumov pre klientske komponenty e-shopu.
// lib/schemas ich má tiež, ale každý import hodnoty odtiaľ pribalí do prehliadača celý Zod.
// Typy sú viazané na schémy, takže pri zmene enumu TypeScript ohlási chýbajúcu hodnotu.
// Návrh presunúť popisky do zdieľaného súboru bez Zodu: docs/requests/eshop.md.
import type { Sweetness, WineColor, WineLine } from "@/lib/schemas";

export const wineLineLabel: Record<WineLine, string> = { ulicka: "Rad Ulička", spras: "Rad Spraš", pivnica: "Rad Pivnica" };
export const wineColorLabel: Record<WineColor, string> = { biele: "biele", ruzove: "ružové", cervene: "červené", sumive: "šumivé" };
export const sweetnessLabel: Record<Sweetness, string> = {
  suche: "suché",
  polosuche: "polosuché",
  polosladke: "polosladké",
  sladke: "sladké",
};

export const wineLines = Object.keys(wineLineLabel) as WineLine[];
export const wineColors = Object.keys(wineColorLabel) as WineColor[];
export const sweetnesses = Object.keys(sweetnessLabel) as Sweetness[];
