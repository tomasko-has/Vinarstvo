import type { Gps } from "@/lib/schemas";

/** Odkaz „Navigovať“: otvorí trasu v mapovej aplikácii telefónu (pešo). */
export function navigationUrl({ lat, lng }: Gps): string {
  const destination = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
}
