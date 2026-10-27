// Formátovanie cien a slovenské tvary slov. Ceny sú vždy v centoch, mena EUR.

const eur = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });

export function formatPrice(cents: number) {
  return eur.format(cents / 100);
}

/** Slovenské skloňovanie podľa počtu: [1, 2–4, 0 a 5+], napr. ["fľaša", "fľaše", "fliaš"]. */
export function plural(n: number, forms: readonly [string, string, string]) {
  if (n === 1) return forms[0];
  if (n >= 2 && n <= 4) return forms[1];
  return forms[2];
}

export const bottleForms = ["fľaša", "fľaše", "fliaš"] as const;
export const slotForms = ["voľné miesto", "voľné miesta", "voľných miest"] as const;
export const pieceForms = ["kus", "kusy", "kusov"] as const;

/** 750 → „0,75 l“ */
export function formatVolume(ml: number) {
  return `${new Intl.NumberFormat("sk-SK").format(ml / 1000)} l`;
}
