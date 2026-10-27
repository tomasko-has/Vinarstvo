"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Gps } from "@/lib/schemas";
import { laneTime, type LaneTime } from "./opening-hours";

// ── Aktuálny čas v uličke ──
// Na serveri (prerender) je null: stav „otvorené“ závisí od času návštevy, nie od času buildu.

const MINUTE = 60_000;
const subscribeMinute = (onChange: () => void) => {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
};
const currentMinute = () => Math.floor(Date.now() / MINUTE);
const noMinute = () => null;

export function useLaneTime(): LaneTime | null {
  const minute = useSyncExternalStore(subscribeMinute, currentMinute, noMinute);
  return minute === null ? null : laneTime(new Date(minute * MINUTE));
}

// ── Poloha návštevníka ──
// Spúšťa sa len po kliknutí; bez povolenia mapa funguje ďalej bez bodky.

export type GeoStatus = "idle" | "locating" | "active" | "denied" | "unavailable" | "error";
export type Position = { gps: Gps; accuracy: number };

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [position, setPosition] = useState<Position | null>(null);
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setPosition(null);
    setStatus("idle");
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    if (watchId.current !== null) return;
    setStatus("locating");
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setPosition({ gps: { lat: p.coords.latitude, lng: p.coords.longitude }, accuracy: p.coords.accuracy });
        setStatus("active");
      },
      (err) => {
        if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
        setPosition(null);
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : err.code === err.POSITION_UNAVAILABLE ? "unavailable" : "error");
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
  }, []);

  useEffect(
    () => () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    },
    [],
  );

  return { status, position, start, stop };
}

/** Formát vzdialenosti pre hlášky: „450 m“, „1,2 km“. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toLocaleString("sk-SK", { maximumFractionDigits: 1 })} km`;
}
