"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/cart/store";
import { useAddedFlash } from "./AddWineToCart";
import { QtyStepper } from "./QtyStepper";

export function AddGiftSet({ setSlug, name }: { setSlug: string; name: string }) {
  const addGiftSets = useCartStore((s) => s.addGiftSets);
  const [qty, setQty] = useState(1);
  const [added, flash] = useAddedFlash(4000);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <QtyStepper value={qty} onChange={setQty} max={99} label={`Množstvo: ${name}`} />
        <Button
          onClick={() => {
            addGiftSets(setSlug, qty);
            setQty(1);
            flash();
          }}
        >
          Do košíka
        </Button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-6 text-sm">
        {added && (
          <>
            Pridané.{" "}
            <Link href="/kosik" className="font-bold text-frankovka underline underline-offset-4">
              Prejsť do košíka
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
