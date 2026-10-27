import type { Metadata } from "next";
import { AlleyExplorer } from "@/components/map/AlleyExplorer";
import { mapGeometry } from "@/components/map/data";
import { MapArtwork } from "@/components/map/MapArtwork";
import { getCellars, getGuideStops, getMapAnchors, getMapPois, getWines } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mapa uličky",
  description:
    "Ilustrovaná mapa Sprašovej uličky: dvanásť vínnych pivníc, kto má práve otvorené, kde sú degustácie a ubytovanie. Funguje aj bez signálu.",
};

export default async function Page() {
  const [cellars, pois, anchors, stops, wines] = await Promise.all([
    getCellars(),
    getMapPois(),
    getMapAnchors(),
    getGuideStops(),
    getWines(),
  ]);
  const { unitsPer100m, northAngle, entrance } = mapGeometry(anchors, pois);

  return (
    <AlleyExplorer
      artwork={<MapArtwork cellars={cellars.map((c) => c.mapPoint)} unitsPer100m={unitsPer100m} northAngle={northAngle} />}
      cellars={cellars}
      pois={pois}
      anchors={anchors}
      lanePoints={[...cellars.map((c) => c.gps), ...stops.map((s) => s.gps)]}
      entrance={entrance}
      wines={wines.map((w) => ({ slug: w.slug, name: w.name }))}
    />
  );
}
