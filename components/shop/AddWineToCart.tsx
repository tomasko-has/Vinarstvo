"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { reservedBottles } from "@/lib/cart/items";
import { useCartItems, useCartStore } from "@/lib/cart/store";
import { QtyStepper } from "./QtyStepper";

/** Koľko fliaš ešte môže ísť do košíka: sklad mínus fľaše a kartóny, ktoré už v ňom sú. */
export function useFreeStock(slug: string, stock: number) {
  const items = useCartItems();
  return Math.max(0, stock - (reservedBottles(items).get(slug) ?? 0));
}

/** Krátke potvrdenie po pridaní, potom sa tlačidlo vráti do pôvodného stavu. */
export function useAddedFlash(ms = 2200) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), ms);
    return () => clearTimeout(t);
  }, [added, ms]);
  return [added, () => setAdded(true)] as const;
}

/** Tlačidlo „Do košíka“ na karte vína (1 kus). */
export function AddWineButton({ slug, name, stock }: { slug: string; name: string; stock: number }) {
  const addBottles = useCartStore((s) => s.addBottles);
  const free = useFreeStock(slug, stock);
  const [added, flash] = useAddedFlash();

  if (stock === 0) {
    return (
      <Button variant="secondary" disabled className="w-full">
        Vypredané
      </Button>
    );
  }
  return (
    <Button
      className="w-full"
      disabled={free === 0}
      onClick={() => {
        addBottles(slug, 1);
        flash();
      }}
      aria-label={`Pridať do košíka: ${name}`}
    >
      <span aria-live="polite">{added ? "Pridané" : free === 0 ? "Všetko v košíku" : "Do košíka"}</span>
    </Button>
  );
}

/** Pridanie do košíka na detaile vína: množstvo + tlačidlo + odkaz do košíka po pridaní. */
export function AddWineWithQty({ slug, name, stock }: { slug: string; name: string; stock: number }) {
  const addBottles = useCartStore((s) => s.addBottles);
  const free = useFreeStock(slug, stock);
  const [qty, setQty] = useState(1);
  const [added, flash] = useAddedFlash(4000);
  const amount = Math.min(qty, Math.max(free, 1));

  if (stock === 0) {
    return (
      <p className="rounded-(--radius-ui) bg-vapno-tien px-4 py-3 font-bold text-pivnica-makka">
        Toto víno je vypredané. Ďalší ročník ohlásime v aktualitách.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <QtyStepper value={amount} onChange={setQty} max={Math.max(free, 1)} label={`Množstvo: ${name}`} />
        <Button
          size="lg"
          disabled={free === 0}
          onClick={() => {
            addBottles(slug, amount);
            setQty(1);
            flash();
          }}
        >
          Do košíka
        </Button>
      </div>
      <p aria-live="polite" className="min-h-6 text-sm text-pivnica-makka">
        {added ? (
          <>
            Pridané do košíka.{" "}
            <Link href="/kosik" className="font-bold text-frankovka underline underline-offset-4">
              Prejsť do košíka
            </Link>
          </>
        ) : free === 0 ? (
          "Všetky dostupné fľaše už máte v košíku."
        ) : null}
      </p>
    </div>
  );
}
