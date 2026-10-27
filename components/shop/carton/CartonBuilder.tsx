"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type DragEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  addBottle,
  availableStock,
  canAddBottle,
  cartonPrice,
  countBySlug,
  fillRandom,
  indexWines,
  removeBottleAt,
} from "@/lib/cart/carton";
import { bottleForms, formatPrice, plural, slotForms } from "@/lib/cart/format";
import { reservedBottles } from "@/lib/cart/items";
import { useCartItems, useCartStore, useHydrated } from "@/lib/cart/store";
import type { ShopConfig, Wine } from "@/lib/schemas";
import { wineMeta } from "../WineCard";
import { BottleGlyph } from "../BottleGlyph";
import { QtyStepper } from "../QtyStepper";
import { ShopIcon } from "../ShopIcon";
import { CartonBox, CartonBoxSkeleton } from "./CartonBox";

type Recommended = ShopConfig["recommendedCartons"][number];

type Props = {
  /** Vína, ktoré môžu ísť do kartónu (0,75 l), vrátane vypredaných */
  wines: Wine[];
  recommended: Recommended[];
  size: number;
  discountPct: number;
};

/**
 * Načíta počiatočný stav z URL: ?upravit=<id kartónu v košíku> alebo ?pridat=<slug vína>.
 * Košík je v localStorage, preto sa skutočný konfigurátor vykreslí až po hydratácii.
 */
export function CartonBuilderLoader(props: Props) {
  const params = useSearchParams();
  const hydrated = useHydrated();
  if (!hydrated) return <CartonBuilderSkeleton size={props.size} />;

  const editId = params.get("upravit");
  const edited = editId
    ? useCartStore.getState().items.find((i) => i.type === "carton" && i.id === editId)
    : undefined;
  const start = params.get("pridat");
  const initial = edited?.type === "carton" ? edited.bottles : start ? [start] : [];

  return (
    <CartonBuilder
      key={edited ? `upravit-${editId}` : `novy-${start ?? ""}`}
      {...props}
      initialBottles={initial}
      editingId={edited ? editId! : undefined}
      missingEdit={Boolean(editId && !edited)}
    />
  );
}

export function CartonBuilderSkeleton({ size }: { size: number }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(22rem,26rem)]">
      <div className="lg:order-2">
        <CartonBoxSkeleton size={size} />
      </div>
      <p className="text-pivnica-makka lg:order-1">Načítavame ponuku vín…</p>
    </div>
  );
}

function CartonBuilder({
  wines,
  recommended,
  size,
  discountPct,
  initialBottles,
  editingId,
  missingEdit,
}: Props & { initialBottles: readonly string[]; editingId?: string; missingEdit: boolean }) {
  const router = useRouter();
  const items = useCartItems();
  const saveCarton = useCartStore((s) => s.saveCarton);

  const index = useMemo(() => indexWines(wines), [wines]);
  // Sklad pre tento kartón: bez fliaš, ktoré už sú v košíku (okrem práve upravovaného kartónu).
  const available = useMemo(
    () => availableStock(wines, reservedBottles(items, editingId)),
    [wines, items, editingId],
  );

  const [bottles, setBottles] = useState<readonly string[]>(() =>
    initialBottles.reduce<readonly string[]>((acc, slug) => addBottle(acc, slug, index, available, size), []),
  );
  const [notice, setNotice] = useState<string | null>(
    missingEdit ? "Tento kartón už v košíku nie je. Zostavte si nový." : null,
  );
  const [added, setAdded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const counts = countBySlug(bottles);
  const price = cartonPrice(bottles, index, discountPct);
  const remaining = size - bottles.length;
  const full = remaining === 0;

  const add = (slug: string) => {
    const check = canAddBottle(bottles, slug, index, available, size);
    if (!check.ok) {
      const wine = index.get(slug);
      setNotice(
        check.reason === "full"
          ? `Kartón je plný. Ak chcete ${wine?.name ?? "iné víno"}, najprv niektorú fľašu vyberte.`
          : check.reason === "out-of-stock"
            ? `${wine?.name ?? "Toto víno"}: viac fliaš na sklade nemáme.`
            : "Toto víno sa do kartónu nedá pridať.",
      );
      return;
    }
    setNotice(null);
    setAdded(false);
    setBottles(addBottle(bottles, slug, index, available, size));
  };

  const removeOne = (slug: string) => {
    setNotice(null);
    setAdded(false);
    setBottles(removeBottleAt(bottles, bottles.lastIndexOf(slug)));
  };

  const removeAt = (i: number) => {
    setNotice(null);
    setAdded(false);
    setBottles(removeBottleAt(bottles, i));
  };

  const startFrom = (carton: Recommended) => {
    const next = carton.bottles.reduce<readonly string[]>((acc, slug) => addBottle(acc, slug, index, available, size), []);
    setBottles(next);
    setAdded(false);
    setNotice(
      next.length < carton.bottles.length
        ? `Niektoré vína z kartónu ${carton.name} už nemáme na sklade v potrebnom počte. Doplňte si voľné miesta.`
        : `Začali ste kartónom ${carton.name}. Fľaše môžete ľubovoľne vymeniť.`,
    );
  };

  const fill = () => {
    const next = fillRandom(bottles, wines, available, size);
    setBottles(next);
    setAdded(false);
    setNotice(next.length < size ? "Na sklade už nie je dosť vína na plný kartón." : null);
  };

  const empty = () => {
    setBottles([]);
    setAdded(false);
    setNotice(null);
  };

  const submit = () => {
    if (!full) return;
    saveCarton([...bottles], editingId);
    if (editingId) {
      router.push("/kosik");
      return;
    }
    setAdded(true);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const slug = e.dataTransfer.getData("text/plain");
    if (slug) add(slug);
  };

  const sorted = useMemo(
    () => [...wines].sort((a, b) => Number(a.stock === 0) - Number(b.stock === 0)),
    [wines],
  );

  return (
    <div className="grid gap-10 pb-28 lg:grid-cols-[1fr_minmax(22rem,26rem)] lg:gap-12 lg:pb-0 xl:gap-16">
      {/* Krabica a súhrn: na mobile hore, na desktope vpravo a prilepené */}
      <section aria-labelledby="vas-karton" className="lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="vas-karton" className="text-2xl">
            {editingId ? "Upravujete kartón" : "Váš kartón"}
          </h2>
          <p className="font-bold tabular-nums">
            {bottles.length} z {size}
          </p>
        </div>

        <div
          className="mt-4"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <CartonBox bottles={bottles} wines={index} size={size} onRemove={removeAt} highlight={dragOver} />
        </div>

        <CartonSummary
          count={bottles.length}
          size={size}
          discountPct={discountPct}
          subtotalCents={price.subtotalCents}
          discountCents={price.discountCents}
          totalCents={price.totalCents}
        />

        <p aria-live="polite" className="mt-3 min-h-6 text-sm font-bold text-frankovka">
          {notice}
        </p>

        {added ? (
          <div className="mt-3 rounded-(--radius-panel) bg-listok p-4 text-vapno">
            <p className="flex items-center gap-2 font-bold">
              <ShopIcon name="check" className="size-5" />
              Kartón je v košíku.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <ButtonLink href="/kosik" className="bg-vapno text-pivnica hover:bg-vapno-tien">
                Prejsť do košíka
              </ButtonLink>
              <button
                type="button"
                onClick={empty}
                className="min-h-11 px-2 font-bold text-vapno underline decoration-2 underline-offset-4"
              >
                Zostaviť ďalší kartón
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <Button size="lg" className="w-full" disabled={!full} onClick={submit}>
              {editingId ? "Uložiť zmeny v kartóne" : "Vložiť kartón do košíka"}
            </Button>
            {!full && (
              <p className="text-center text-sm text-pivnica-makka">
                Do košíka ide len plný kartón. Pridajte ešte {remaining} {plural(remaining, ["fľašu", "fľaše", "fliaš"])}.
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-x-6">
              <button
                type="button"
                onClick={fill}
                disabled={full}
                className="inline-flex min-h-11 items-center gap-2 font-bold text-frankovka disabled:opacity-40"
              >
                <ShopIcon name="shuffle" className="size-5" />
                Doplniť náhodne
              </button>
              <button
                type="button"
                onClick={empty}
                disabled={bottles.length === 0}
                className="inline-flex min-h-11 items-center gap-2 font-bold text-pivnica-makka disabled:opacity-40"
              >
                Vyprázdniť
              </button>
            </div>
            {editingId && (
              <p className="text-center text-sm">
                <Link href="/kosik" className="text-pivnica-makka underline underline-offset-4">
                  Späť do košíka bez zmien
                </Link>
              </p>
            )}
          </div>
        )}
      </section>

      <div className="lg:order-1">
        <section aria-labelledby="odporucane">
          <h2 id="odporucane" className="text-xl">
            Nechcete začínať od nuly?
          </h2>
          <p className="mt-1 text-pivnica-makka">Vezmite náš kartón ako základ a vymeňte, čo vám nesedí.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {recommended.map((carton) => {
              const p = cartonPrice(carton.bottles, index, discountPct);
              return (
                <li key={carton.slug}>
                  <button
                    type="button"
                    onClick={() => startFrom(carton)}
                    className="flex h-full w-full flex-col rounded-(--radius-panel) border-2 border-vapno-tien bg-vapno p-4 text-left transition-colors hover:border-pivnica"
                  >
                    <span className="flex h-10 items-end gap-0.5" aria-hidden="true">
                      {carton.bottles.map((slug, i) => {
                        const w = index.get(slug);
                        return w ? <BottleGlyph key={i} color={w.color} className="h-10 w-auto" /> : null;
                      })}
                    </span>
                    <span className="mt-3 font-display text-lg font-bold">{carton.name}</span>
                    <span className="mt-1 text-sm text-pivnica-makka">{carton.description}</span>
                    <span className="mt-auto pt-3 font-bold text-frankovka tabular-nums">{formatPrice(p.totalCents)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="vyber-vin" className="mt-12">
          <h2 id="vyber-vin" className="text-xl">
            Vyberte vína
          </h2>
          <p className="mt-1 text-pivnica-makka">
            To isté víno môže byť v kartóne aj viackrát.
            <span className="hidden lg:inline"> Fľašu môžete do krabice aj pretiahnuť myšou.</span>
          </p>
          <ul className="mt-4 divide-y divide-vapno-tien border-y border-vapno-tien">
            {sorted.map((wine) => {
              const inCarton = counts.get(wine.slug) ?? 0;
              const free = available.get(wine.slug) ?? 0;
              const canAdd = canAddBottle(bottles, wine.slug, index, available, size).ok;
              const soldOut = wine.stock === 0;
              return (
                <li
                  key={wine.slug}
                  draggable={!soldOut}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", wine.slug);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  className={`flex items-center gap-3 py-3 sm:gap-4 ${soldOut ? "opacity-55" : "lg:cursor-grab"}`}
                >
                  <BottleGlyph color={wine.color} className="h-14 w-auto shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-snug">
                      <Link href={`/e-shop/${wine.slug}`} className="hover:text-frankovka hover:underline">
                        {wine.name}
                      </Link>
                    </p>
                    <p className="text-sm text-pivnica-makka">{wineMeta(wine)}</p>
                    <p className="text-sm">
                      <span className="font-bold text-frankovka tabular-nums">{formatPrice(wine.priceCents)}</span>
                      {soldOut ? (
                        <span className="text-pivnica-makka">, vypredané</span>
                      ) : free - inCarton <= 6 ? (
                        <span className="text-pivnica-makka">
                          , {free - inCarton > 0 ? `na sklade ešte ${free - inCarton}` : "viac nemáme"}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {inCarton > 0 ? (
                    <QtyStepper
                      value={inCarton}
                      min={0}
                      max={canAdd ? undefined : inCarton}
                      onChange={(v) => (v > inCarton ? add(wine.slug) : removeOne(wine.slug))}
                      label={`V kartóne: ${wine.name}`}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={!canAdd}
                      onClick={() => add(wine.slug)}
                      aria-label={`Pridať do kartónu: ${wine.name}`}
                      className="min-h-11 shrink-0 rounded-(--radius-ui) border-2 border-pivnica px-3 font-bold transition-colors hover:bg-pivnica hover:text-vapno disabled:cursor-not-allowed disabled:border-vapno-tien disabled:text-pivnica-makka disabled:hover:bg-transparent"
                    >
                      {soldOut ? "Vypredané" : "Pridať"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Mobilná lišta so stavom kartónu nad spodnou navigáciou */}
      <div className="fixed inset-x-0 bottom-(--spacing-tabbar) z-30 border-t border-spras-tmava/40 bg-spras-svetla px-(--spacing-gutter) py-2 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold">
              {bottles.length} z {size} {plural(size, bottleForms)}
              {!full && <span className="font-normal">, {remaining} {plural(remaining, slotForms)}</span>}
            </p>
            <p className="font-bold text-frankovka tabular-nums">{formatPrice(price.totalCents)}</p>
          </div>
          {added ? (
            <ButtonLink href="/kosik">Do košíka</ButtonLink>
          ) : (
            <Button disabled={!full} onClick={submit}>
              {editingId ? "Uložiť" : "Vložiť do košíka"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartonSummary({
  count,
  size,
  discountPct,
  subtotalCents,
  discountCents,
  totalCents,
}: {
  count: number;
  size: number;
  discountPct: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}) {
  const remaining = size - count;
  return (
    <div className="mt-5 rounded-(--radius-panel) bg-pivnica p-5 text-vapno">
      <dl className="space-y-1.5 tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-vapno/80">
            {count} {plural(count, bottleForms)} bez zľavy
          </dt>
          <dd>{formatPrice(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-vapno/80">Zľava za kartón {discountPct} %</dt>
          <dd>−{formatPrice(discountCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-white/15 pt-2">
          <dt className="font-display text-lg font-bold">Spolu</dt>
          <dd className="font-display text-2xl font-bold text-spras">{formatPrice(totalCents)}</dd>
        </div>
      </dl>
      <p aria-live="polite" className="mt-2 text-sm text-vapno/80">
        {discountCents > 0 && <>Ušetríte {formatPrice(discountCents)}. </>}
        {remaining > 0
          ? `${remaining >= 2 && remaining <= 4 ? "Zostávajú" : "Zostáva"} ${remaining} ${plural(remaining, slotForms)}.`
          : "Kartón je plný."}
      </p>
    </div>
  );
}
