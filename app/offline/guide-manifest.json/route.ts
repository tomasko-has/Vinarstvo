import { buildGuideManifest } from "@/lib/offline/manifest";
import { getCellars, getGuideStops } from "@/lib/content";

export async function GET() {
  const [cellars, stops] = await Promise.all([getCellars(), getGuideStops()]);
  return Response.json(buildGuideManifest({ cellars, stops }));
}
