import type { Gps, MapPoint } from "@/lib/schemas";
import type { GeoTransform } from "./affine";

const EARTH_RADIUS_M = 6_371_000;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Vzdialenosť dvoch GPS bodov v metroch (haversine). */
export function distanceMeters(a: Gps, b: Gps): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Najmenšia vzdialenosť k niektorému z bodov uličky (pivnice, zastávky). */
export function distanceToNearest(position: Gps, points: Gps[]): number {
  return points.reduce((min, p) => Math.min(min, distanceMeters(position, p)), Infinity);
}

/** Hranica, za ktorou hlásime „Ste mimo uličky“. */
export const OUTSIDE_LANE_METERS = 300;

export function isOutsideLane(position: Gps, lanePoints: Gps[], limit = OUTSIDE_LANE_METERS): boolean {
  return distanceToNearest(position, lanePoints) > limit;
}

/** Posun GPS bodu o metre na východ a sever. */
export function offsetGps({ lat, lng }: Gps, eastM: number, northM: number): Gps {
  return {
    lat: lat + (northM / EARTH_RADIUS_M) * (180 / Math.PI),
    lng: lng + (eastM / (EARTH_RADIUS_M * Math.cos(rad(lat)))) * (180 / Math.PI),
  };
}

const svgDistance = (a: MapPoint, b: MapPoint) => Math.hypot(a.x - b.x, a.y - b.y);

/** Polomer kruhu presnosti v jednotkách SVG (priemer cez východný a severný smer). */
export function metersToSvg(transform: GeoTransform, at: Gps, meters: number): number {
  const center = transform.toSvg(at);
  const east = transform.toSvg(offsetGps(at, meters, 0));
  const north = transform.toSvg(offsetGps(at, 0, meters));
  return (svgDistance(center, east) + svgDistance(center, north)) / 2;
}
