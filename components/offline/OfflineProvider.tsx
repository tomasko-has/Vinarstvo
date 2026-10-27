"use client";

import { useEffect } from "react";
import { SW_URL } from "@/lib/offline/constants";
import { InstallPrompt } from "./InstallPrompt";
import { OfflineBanner } from "./OfflineBanner";

/**
 * Registruje Service Worker (len v produkcii) a vykreslí offline pruh a výzvu na inštaláciu.
 * Vo vývoji SW odregistruje, aby nerušil hot reload.
 */
export function OfflineProvider() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }
    navigator.serviceWorker.register(SW_URL, { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);

  return (
    <>
      <OfflineBanner />
      <InstallPrompt />
    </>
  );
}
