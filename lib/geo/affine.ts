// Prepočet GPS ↔ SVG súradníc mapy cez afinnú transformáciu z troch kotevných bodov.
// Ulička má pár stoviek metrov, takže zakrivenie Zeme zanedbávame a GPS berieme ako rovinu.
import type { Gps, MapAnchors, MapPoint } from "@/lib/schemas";

export type GeoTransform = {
  toSvg: (gps: Gps) => MapPoint;
  toGps: (point: MapPoint) => Gps;
};

type Matrix = { a: number; b: number; c: number; d: number; e: number; f: number };

// x = a·u + b·v + c, y = d·u + e·v + f, kde (u, v) = (lng, lat) posunuté k prvej kotve kvôli presnosti
function solve(from: [number, number][], to: [number, number][]): Matrix {
  const [[u1, v1], [u2, v2], [u3, v3]] = from;
  const det = u1 * (v2 - v3) - v1 * (u2 - u3) + (u2 * v3 - u3 * v2);
  if (Math.abs(det) < 1e-18) {
    throw new Error("Kotevné body ležia na jednej priamke, transformácia sa nedá určiť.");
  }
  // Cramerovo pravidlo pre sústavu [u v 1]·[a b c]ᵀ = x (a rovnako pre y)
  const coeffs = (t1: number, t2: number, t3: number) => ({
    p: (t1 * (v2 - v3) - v1 * (t2 - t3) + (t2 * v3 - t3 * v2)) / det,
    q: (u1 * (t2 - t3) - t1 * (u2 - u3) + (u2 * t3 - u3 * t2)) / det,
    r: (u1 * (v2 * t3 - v3 * t2) - v1 * (u2 * t3 - u3 * t2) + t1 * (u2 * v3 - u3 * v2)) / det,
  });
  const x = coeffs(to[0][0], to[1][0], to[2][0]);
  const y = coeffs(to[0][1], to[1][1], to[2][1]);
  return { a: x.p, b: x.q, c: x.r, d: y.p, e: y.q, f: y.r };
}

function invert({ a, b, c, d, e, f }: Matrix): Matrix {
  const det = a * e - b * d;
  return {
    a: e / det,
    b: -b / det,
    c: (b * f - c * e) / det,
    d: -d / det,
    e: a / det,
    f: (c * d - a * f) / det,
  };
}

export function createGeoTransform(anchors: MapAnchors): GeoTransform {
  const origin = anchors[0].gps;
  const local = anchors.map(({ gps }) => [gps.lng - origin.lng, gps.lat - origin.lat] as [number, number]);
  const svg = anchors.map(({ svg }) => [svg.x, svg.y] as [number, number]);
  const forward = solve(local, svg);
  const back = invert(forward);

  return {
    toSvg({ lat, lng }) {
      const u = lng - origin.lng;
      const v = lat - origin.lat;
      return { x: forward.a * u + forward.b * v + forward.c, y: forward.d * u + forward.e * v + forward.f };
    },
    toGps({ x, y }) {
      const u = back.a * x + back.b * y + back.c;
      const v = back.d * x + back.e * y + back.f;
      return { lat: origin.lat + v, lng: origin.lng + u };
    },
  };
}
