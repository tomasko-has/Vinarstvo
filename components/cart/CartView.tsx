"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { BottleGlyph, VialGlyph } from "@/components/shop/BottleGlyph";
import { QtyStepper } from "@/components/shop/QtyStepper";
import { Button, ButtonLink } from "@/components/ui/Button";
import { countBySlug } from "@/lib/cart/carton";
import { formatPrice, plural } from "@/lib/cart/format";
import { itemKey, reservedBottles } from "@/lib/cart/items";
import { useCartItems, useCartStore, useHydrated } from "@/lib/cart/store";
import { cartTotals, indexCatalog, linePrice, stockProblems, type CatalogIndex, type ShopCatalog } from "@/lib/cart/totals";
import type { CartItem } from "@/lib/schemas";
import { site } from "@/lib/site";
import { useOnline } from "./useOnline";

export function CartView({ catalog }: { catalog: ShopCatalog }) {
  const hydrated = useHydrated();
  const items = useCartItems();
  const index = useMemo(() => indexCatalog(catalog), [catalog]);

  if (!hydrated) {
    return <p className="py-10 text-pivnica-makka">Načítavame košík…</p>;
  }
  if (items.length === 0) return <EmptyCart />;

  return <FilledCart items={items} catalog={index} />;
}

function EmptyCart() {
  return (
    <div className="max-w-xl py-6">
      <p className="font-display text-2xl font-bold">Košík je zatiaľ prázdny.</p>
      <p className="mt-2 text-pivnica-makka">
        Vyberte si fľašu, zostavte kartón so zľavou alebo začnite mini-setom vzoriek. Košík si pamätá, čo doň dáte, aj
        keď ste offline.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/e-shop">Pozrieť vína</ButtonLink>
        <ButtonLink href="/e-shop/zostav-si-karton" variant="secondary">
          Zostaviť kartón
        </ButtonLink>
        <ButtonLink href="/e-shop/mini-sety" variant="quiet">
          Mini-sety na ochutnanie
        </ButtonLink>
      </div>
    </div>
  );
}

function FilledCart({ items, catalog }: { items: CartItem[]; catalog: CatalogIndex }) {
  const totals = cartTotals(items, catalog);
  const problems = stockProblems(items, catalog.wines);
  const remove = useCartStore((s) => s.remove);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(20rem,24rem)] lg:gap-12">
      <div>
        {problems.length > 0 && (
          <div role="alert" className="mb-6 rounded-(--radius-panel) border-2 border-chyba p-4">
            <p className="font-bold text-chyba">Niektorých vín máte v košíku viac, než je na sklade.</p>
            <ul className="mt-2 space-y-1 text-sm">
              {problems.map((p) => (
                <li key={p.slug}>
                  {catalog.wines.get(p.slug)?.name}: v košíku {p.requested}, na sklade{" "}
                  {p.stock === 0 ? "už nie je" : p.stock}.
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="divide-y divide-vapno-tien border-y-2 border-pivnica">
          {items.map((item) => {
            const key = itemKey(item);
            const price = linePrice(item, catalog);
            return (
              <li key={key} className="py-5">
                {price ? (
                  <CartLine item={item} items={items} catalog={catalog} />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-pivnica-makka">Táto položka už nie je v ponuke.</p>
                    <RemoveButton onClick={() => remove(key)} label="Odobrať nedostupnú položku" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-4">
          <Link href="/e-shop" className="font-bold text-frankovka underline underline-offset-4">
            Pokračovať v nákupe
          </Link>
        </p>
      </div>

      <CartSummary
        subtotalCents={totals.subtotalCents}
        discountCents={totals.discountCents}
        totalCents={totals.totalCents}
        hasProblems={problems.length > 0}
      />
    </div>
  );
}

function CartLine({ item, items, catalog }: { item: CartItem; items: CartItem[]; catalog: CatalogIndex }) {
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const key = itemKey(item);
  const price = linePrice(item, catalog)!;

  switch (item.type) {
    case "bottle": {
      const wine = catalog.wines.get(item.wineSlug)!;
      // Maximum: sklad mínus fľaše v kartónoch (táto položka sa nepočíta).
      const max = Math.max(item.qty, wine.stock - ((reservedBottles(items).get(wine.slug) ?? 0) - item.qty));
      return (
        <LineLayout
          visual={
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-(--radius-obluk) bg-spras-svetla">
              {wine.images[0] && <Image src={wine.images[0].src} alt="" fill sizes="5rem" className="object-cover" />}
            </div>
          }
          title={
            <Link href={`/e-shop/${wine.slug}`} className="hover:text-frankovka hover:underline">
              {wine.name} {wine.vintage}
            </Link>
          }
          detail={`${formatPrice(wine.priceCents)} za fľašu`}
          price={<LinePrice totalCents={price.totalCents} />}
          actions={
            <>
              <QtyStepper value={item.qty} max={max} onChange={(q) => setQty(key, q)} label={`Množstvo: ${wine.name}`} />
              <RemoveButton onClick={() => remove(key)} label={`Odobrať ${wine.name}`} />
            </>
          }
        />
      );
    }
    case "carton": {
      const groups = [...countBySlug(item.bottles)];
      return (
        <LineLayout
          visual={<CartonThumb bottles={item.bottles} catalog={catalog} />}
          title={`Kartón ${item.bottles.length} fliaš`}
          detail={
            <ul>
              {groups.map(([slug, n]) => (
                <li key={slug}>
                  {n}× {catalog.wines.get(slug)?.name}
                </li>
              ))}
            </ul>
          }
          price={
            <LinePrice
              totalCents={price.totalCents}
              subtotalCents={price.subtotalCents}
              note={`zľava ${catalog.cartonDiscountPct} %`}
            />
          }
          actions={
            <>
              <ButtonLink href={`/e-shop/zostav-si-karton?upravit=${item.id}`} variant="secondary">
                Upraviť kartón
              </ButtonLink>
              <RemoveButton onClick={() => remove(key)} label="Odobrať kartón" />
            </>
          }
        />
      );
    }
    case "mini-set": {
      const set = item.setSlug ? catalog.miniSets.get(item.setSlug) : undefined;
      const samples = item.custom ?? set?.tastingOrder ?? [];
      const cardHref = set ? `/e-shop/mini-sety/karta?set=${set.slug}` : `/e-shop/mini-sety/karta?vzorky=${samples.join(",")}`;
      return (
        <LineLayout
          visual={
            <div className="flex h-full items-end justify-center gap-px rounded-(--radius-ui) bg-spras-svetla px-1 pt-2" aria-hidden="true">
              {samples.map((slug, i) => {
                const wine = catalog.wines.get(slug);
                return wine ? <VialGlyph key={i} color={wine.color} className="h-12 w-auto" /> : null;
              })}
            </div>
          }
          title={set ? `Mini-set ${set.name}` : "Vlastný mini-set"}
          detail={
            <>
              {samples.map((slug) => catalog.wines.get(slug)?.name).join(", ")}
              <br />
              <Link href={cardHref} className="font-bold text-pivnica underline underline-offset-4">
                Degustačná karta
              </Link>
            </>
          }
          price={<LinePrice totalCents={price.totalCents} />}
          actions={<RemoveButton onClick={() => remove(key)} label="Odobrať mini-set" />}
        />
      );
    }
    case "gift-set": {
      const set = catalog.giftSets.get(item.setSlug)!;
      return (
        <LineLayout
          visual={
            <div className="relative aspect-square w-full overflow-hidden rounded-(--radius-ui) bg-spras-svetla">
              <Image src={set.image.src} alt="" fill sizes="5rem" className="object-cover" />
            </div>
          }
          title={set.name}
          detail={`Darčeková sada, ${formatPrice(set.priceCents)} za kus`}
          price={<LinePrice totalCents={price.totalCents} />}
          actions={
            <>
              <QtyStepper value={item.qty} max={99} onChange={(q) => setQty(key, q)} label={`Množstvo: ${set.name}`} />
              <RemoveButton onClick={() => remove(key)} label={`Odobrať ${set.name}`} />
            </>
          }
        />
      );
    }
  }
}

function LineLayout({
  visual,
  title,
  detail,
  price,
  actions,
}: {
  visual: ReactNode;
  title: ReactNode;
  detail: ReactNode;
  price: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-3 sm:grid-cols-[5.5rem_1fr_auto]">
      <div className="row-span-2 self-start sm:row-span-2">{visual}</div>
      <div className="min-w-0">
        <h2 className="font-display text-lg leading-snug font-bold">{title}</h2>
        <div className="mt-1 text-sm text-pivnica-makka">{detail}</div>
      </div>
      <div className="col-start-2 sm:col-start-3 sm:row-start-1 sm:text-right">{price}</div>
      <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-2">{actions}</div>
    </div>
  );
}

function LinePrice({ totalCents, subtotalCents, note }: { totalCents: number; subtotalCents?: number; note?: string }) {
  return (
    <p className="tabular-nums">
      <span className="font-display text-xl font-bold text-frankovka">{formatPrice(totalCents)}</span>
      {subtotalCents !== undefined && subtotalCents !== totalCents && (
        <span className="block text-sm text-pivnica-makka">
          <s>{formatPrice(subtotalCents)}</s> {note}
        </span>
      )}
    </p>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="min-h-11 px-1 text-sm font-bold text-pivnica-makka underline underline-offset-4 hover:text-chyba"
    >
      Odobrať
    </button>
  );
}

function CartonThumb({ bottles, catalog }: { bottles: readonly string[]; catalog: CatalogIndex }) {
  return (
    <div className="grid grid-cols-3 gap-0.5 rounded-(--radius-ui) border-2 border-spras-tmava bg-spras p-1" aria-hidden="true">
      {bottles.map((slug, i) => {
        const wine = catalog.wines.get(slug);
        return (
          <div key={i} className="flex aspect-[3/4] items-end justify-center rounded-t-full bg-spras-tmava">
            {wine && <BottleGlyph color={wine.color} className="h-[90%] w-auto" />}
          </div>
        );
      })}
    </div>
  );
}

function CartSummary({
  subtotalCents,
  discountCents,
  totalCents,
  hasProblems,
}: {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  hasProblems: boolean;
}) {
  const online = useOnline();
  const count = useCartStore((s) => s.items.length);
  const clear = useCartStore((s) => s.clear);

  return (
    <aside aria-labelledby="suhrn" className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-(--radius-panel) bg-pivnica p-5 text-vapno sm:p-6">
        <h2 id="suhrn" className="text-xl">
          Súhrn objednávky
        </h2>
        <dl className="mt-4 space-y-1.5 tabular-nums">
          <div className="flex justify-between gap-4">
            <dt className="text-vapno/80">
              {count} {plural(count, ["položka", "položky", "položiek"])} bez zliav
            </dt>
            <dd>{formatPrice(subtotalCents)}</dd>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-vapno/80">Zľavy za kartóny</dt>
              <dd>−{formatPrice(discountCents)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 border-t border-white/15 pt-2">
            <dt className="font-display text-lg font-bold">Spolu s DPH</dt>
            <dd className="font-display text-2xl font-bold text-spras">{formatPrice(totalCents)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-sm text-vapno/70">
          Dopravu vypočítame v pokladni.{" "}
          <Link href="/doprava-a-platba" className="underline underline-offset-2 hover:text-vapno">
            Doprava a platba
          </Link>
        </p>

        <Button size="lg" className="mt-5 w-full" disabled aria-describedby="pokladna-info">
          Pokračovať k pokladni
        </Button>
        <div id="pokladna-info" className="mt-3 space-y-2 text-sm text-vapno/85">
          {!online && (
            <p className="font-bold text-spras">
              Ste offline. Košík máte uložený v tomto zariadení, k pokladni sa dostanete po pripojení.
            </p>
          )}
          {hasProblems && <p className="font-bold text-spras">Pred objednávkou upravte množstvá podľa skladu.</p>}
          <p>
            Objednávky cez web spúšťame čoskoro. Dovtedy nám obsah košíka pošlite na{" "}
            <a href={`mailto:${site.email}`} className="font-bold underline underline-offset-2">
              {site.email}
            </a>{" "}
            alebo zavolajte na{" "}
            <a href={`tel:${site.phone.replaceAll(" ", "")}`} className="font-bold whitespace-nowrap underline underline-offset-2">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-pivnica-makka">
        Víno predávame len osobám starším ako 18 rokov. Vek overí kuriér pri doručení.
      </p>
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Naozaj vyprázdniť celý košík?")) clear();
        }}
        className="mt-2 min-h-11 text-sm font-bold text-pivnica-makka underline underline-offset-4 hover:text-chyba"
      >
        Vyprázdniť košík
      </button>
    </aside>
  );
}
