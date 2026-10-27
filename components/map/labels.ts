import type { Cellar } from "@/lib/schemas";

const featureLabel: Record<Cellar["features"][number], string> = {
  degustacia: "degustácie",
  predaj: "predaj vína",
  ubytovanie: "ubytovanie",
};

/** „Degustácie, predaj vína a ubytovanie“ */
export function featuresText(features: Cellar["features"]): string {
  const words = features.map((f) => featureLabel[f]);
  if (words.length === 0) return "";
  const text = words.length === 1 ? words[0] : `${words.slice(0, -1).join(", ")} a ${words[words.length - 1]}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
