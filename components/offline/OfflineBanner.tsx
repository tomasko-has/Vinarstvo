"use client";

import { useOnline } from "./useOnline";

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-40 bg-pivnica px-4 py-2 text-center text-sm font-bold text-vapno">
      Ste offline, zobrazujeme uložený obsah.
    </div>
  );
}
