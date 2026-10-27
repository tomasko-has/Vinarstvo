"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "install-prompt-dismissed";
const SHOWN_ON = ["/mapa", "/sprievodca"];

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};
const isIosSafari = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !("standalone" in navigator && navigator.standalone);

/** Jemná výzva „Pridať na plochu“, len na mape a v sprievodcovi, a len kým ju používateľ nezavrie. */
export function InstallPrompt() {
  const pathname = usePathname();
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const ios = useSyncExternalStore(noopSubscribe, isIosSafari, () => false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const hidden = dismissed || (typeof window !== "undefined" && readDismissed());
  const onRoute = SHOWN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!onRoute || hidden || (!event && !ios)) return null;

  const close = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <aside
      aria-label="Pridať na plochu"
      className="fixed inset-x-3 bottom-[calc(var(--spacing-tabbar)+0.75rem)] z-40 mx-auto flex max-w-md items-center gap-3 rounded-(--radius-ui) border-2 border-spras-tmava bg-spras-svetla p-3 text-pivnica shadow-lg lg:bottom-4"
    >
      <p className="flex-1 text-sm">
        {event
          ? "Mapa a sprievodca na ploche telefónu fungujú aj bez signálu."
          : "V Safari ťuknite na Zdieľať a vyberte Pridať na plochu. Mapa potom funguje aj bez signálu."}
      </p>
      {event && (
        <Button
          size="md"
          onClick={async () => {
            await event.prompt();
            await event.userChoice;
            setEvent(null);
          }}
        >
          Pridať na plochu
        </Button>
      )}
      <Button variant="quiet" onClick={close} aria-label="Zavrieť výzvu">
        Nie teraz
      </Button>
    </aside>
  );
}
