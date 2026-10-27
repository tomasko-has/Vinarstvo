import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { z } from "zod";

// Obsah viníc je len podklad pre stránku /vinarstvo/vinice, preto schéma žije tu a nie v lib/schemas.
export const vineyardSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  /** Musí sa zhodovať s poľom `vineyard` vo vínach */
  name: z.string().min(1),
  areaHa: z.number().positive(),
  planted: z.number().int().min(1900),
  exposure: z.string().min(1),
  soil: z.string().min(1),
  varieties: z.array(z.string()).min(1),
  summary: z.string().min(1),
  story: z.string().min(1),
});

export const vineyardsSchema = z.array(vineyardSchema).length(4);
export type Vineyard = z.infer<typeof vineyardSchema>;

export async function getVineyards() {
  "use cache";
  cacheLife("max");
  const raw = await readFile(path.join(process.cwd(), "content", "pages", "vinice.json"), "utf8");
  return vineyardsSchema.parse(JSON.parse(raw));
}
