import { describe, expect, it } from "vitest";
import type { MapAnchors } from "@/lib/schemas";
import { createGeoTransform } from "./affine";
import { distanceMeters, distanceToNearest, isOutsideLane, metersToSvg, offsetGps } from "./distance";
import { navigationUrl } from "./navigation";

const anchors: MapAnchors = [
  { gps: { lat: 48.201, lng: 17.79 }, svg: { x: 50, y: 300 } },
  { gps: { lat: 48.2014, lng: 17.7954 }, svg: { x: 950, y: 300 } },
  { gps: { lat: 48.2026, lng: 17.7927 }, svg: { x: 500, y: 100 } },
];

describe("createGeoTransform", () => {
  const t = createGeoTransform(anchors);

  it("kotevné body sa zobrazia presne na svoje SVG súradnice", () => {
    for (const a of anchors) {
      const p = t.toSvg(a.gps);
      expect(p.x).toBeCloseTo(a.svg.x, 6);
      expect(p.y).toBeCloseTo(a.svg.y, 6);
    }
  });

  it("zachováva afinitu: stred úsečky GPS je stred úsečky SVG", () => {
    const mid = t.toSvg({
      lat: (anchors[0].gps.lat + anchors[1].gps.lat) / 2,
      lng: (anchors[0].gps.lng + anchors[1].gps.lng) / 2,
    });
    expect(mid.x).toBeCloseTo(500, 6);
    expect(mid.y).toBeCloseTo(300, 6);
  });

  it("toGps je inverzia toSvg", () => {
    const gps = { lat: 48.20131, lng: 17.79277 };
    const back = t.toGps(t.toSvg(gps));
    expect(back.lat).toBeCloseTo(gps.lat, 9);
    expect(back.lng).toBeCloseTo(gps.lng, 9);
    for (const a of anchors) {
      const g = t.toGps(a.svg);
      expect(g.lat).toBeCloseTo(a.gps.lat, 9);
      expect(g.lng).toBeCloseTo(a.gps.lng, 9);
    }
  });

  it("funguje aj s otočenou a zrkadlenou mapou", () => {
    const flipped = createGeoTransform([
      { gps: { lat: 0, lng: 0 }, svg: { x: 100, y: 100 } },
      { gps: { lat: 0, lng: 1 }, svg: { x: 100, y: 200 } },
      { gps: { lat: 1, lng: 0 }, svg: { x: 0, y: 100 } },
    ]);
    const p = flipped.toSvg({ lat: 0.5, lng: 0.5 });
    expect(p.x).toBeCloseTo(50, 9);
    expect(p.y).toBeCloseTo(150, 9);
  });

  it("odmietne kotvy na jednej priamke", () => {
    expect(() =>
      createGeoTransform([
        { gps: { lat: 48.2, lng: 17.79 }, svg: { x: 0, y: 0 } },
        { gps: { lat: 48.201, lng: 17.791 }, svg: { x: 10, y: 10 } },
        { gps: { lat: 48.202, lng: 17.792 }, svg: { x: 20, y: 20 } },
      ]),
    ).toThrow(/priamke/);
  });
});

describe("vzdialenosti", () => {
  it("haversine: 0,001° zemepisnej šírky je asi 111 m", () => {
    expect(distanceMeters({ lat: 48.2, lng: 17.79 }, { lat: 48.201, lng: 17.79 })).toBeCloseTo(111.2, 0);
    expect(distanceMeters({ lat: 48.2, lng: 17.79 }, { lat: 48.2, lng: 17.79 })).toBe(0);
  });

  it("offsetGps posunie bod o zadané metre", () => {
    const start = { lat: 48.2015, lng: 17.7927 };
    expect(distanceMeters(start, offsetGps(start, 300, 0))).toBeCloseTo(300, 1);
    expect(distanceMeters(start, offsetGps(start, 0, -50))).toBeCloseTo(50, 1);
  });

  it("mimo uličky až nad 300 m od najbližšieho bodu", () => {
    const lane = [
      { lat: 48.201, lng: 17.79 },
      { lat: 48.2014, lng: 17.7954 },
    ];
    const near = offsetGps(lane[1], 290, 0);
    const far = offsetGps(lane[1], 310, 0);
    expect(distanceToNearest(near, lane)).toBeCloseTo(290, 0);
    expect(isOutsideLane(near, lane)).toBe(false);
    expect(isOutsideLane(far, lane)).toBe(true);
    expect(isOutsideLane(far, [])).toBe(true);
  });

  it("metersToSvg zodpovedá mierke mapy", () => {
    const t = createGeoTransform(anchors);
    // kotvy 0 a 1 sú od seba ~410 m a na mape 900 jednotiek
    const meters = distanceMeters(anchors[0].gps, anchors[1].gps);
    const r = metersToSvg(t, anchors[0].gps, meters);
    expect(r).toBeGreaterThan(900 * 0.7);
    expect(r).toBeLessThan(900 * 1.3);
  });
});

describe("navigationUrl", () => {
  it("vytvorí pešiu trasu na súradnice", () => {
    expect(navigationUrl({ lat: 48.201004, lng: 17.79006 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=48.201004,17.790060&travelmode=walking",
    );
  });
});
