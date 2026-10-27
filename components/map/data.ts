// Príprava dát pre mapu na serveri: mierka, sever, vstup do uličky. Volajú to stránky v app/mapa a app/sprievodca.
import { createGeoTransform } from "@/lib/geo/affine";
import { distanceMeters, offsetGps } from "@/lib/geo/distance";
import type { Gps, MapAnchors, MapPoi } from "@/lib/schemas";

export function mapGeometry(anchors: MapAnchors, pois: MapPoi[]) {
  const transform = createGeoTransform(anchors);
  const a = transform.toGps({ x: 0, y: 300 });
  const b = transform.toGps({ x: 100, y: 300 });
  const unitsPer100m = (100 / distanceMeters(a, b)) * 100;

  const center = transform.toGps({ x: 500, y: 300 });
  const c = transform.toSvg(center);
  const n = transform.toSvg(offsetGps(center, 0, 50));
  const northAngle = (Math.atan2(n.x - c.x, -(n.y - c.y)) * 180) / Math.PI;

  const gate = pois.find((p) => p.kind === "vstup");
  const entrance: Gps = transform.toGps(gate?.mapPoint ?? { x: 40, y: 300 });

  return { unitsPer100m, northAngle, entrance };
}
