// Poradie ochutnávania pre vlastný mini-set: od šumivého cez biele a ružové po červené,
// v rámci farby od suchého po sladké a od ľahkého po plné.
import type { Sweetness, Wine, WineColor } from "@/lib/schemas";

const colorOrder: Record<WineColor, number> = { sumive: 0, biele: 1, ruzove: 2, cervene: 3 };
const sweetnessOrder: Record<Sweetness, number> = { suche: 0, polosuche: 1, polosladke: 2, sladke: 3 };

export function suggestTastingOrder<W extends Pick<Wine, "slug" | "color" | "sweetness" | "tasting">>(wines: readonly W[]) {
  return [...wines].sort(
    (a, b) =>
      // Sladké vína idú vždy na koniec, aj červené po nich chutia ploché.
      Number(sweetnessOrder[a.sweetness] >= 2) - Number(sweetnessOrder[b.sweetness] >= 2) ||
      colorOrder[a.color] - colorOrder[b.color] ||
      sweetnessOrder[a.sweetness] - sweetnessOrder[b.sweetness] ||
      a.tasting.body - b.tasting.body,
  );
}

/** Mini-set má vždy šesť vzoriek (schéma MiniSet aj CartItem). */
export const MINI_SET_SIZE = 6;
