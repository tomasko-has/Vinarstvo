// Konfigurácia e-shopu pre session B. Zdieľaná schéma (lib/schemas) zatiaľ nepozná cenu vlastného
// mini-setu, preto ju tu rozširujeme lokálne. Návrh na zmenu schémy: docs/requests/eshop.md.
import { z } from "zod";
import raw from "@/content/shop-config.json";
import { shopConfigSchema } from "@/lib/schemas";

export const eshopConfigSchema = shopConfigSchema.extend({
  /** Cena vlastného mini-setu (6 vzoriek podľa výberu zákazníka). */
  customMiniSetPriceCents: z.number().int().nonnegative(),
});

export type EshopConfig = z.infer<typeof eshopConfigSchema>;

export const eshopConfig: EshopConfig = eshopConfigSchema.parse(raw);
