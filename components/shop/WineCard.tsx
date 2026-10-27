import Link from "next/link";
import { formatPrice, formatVolume } from "@/lib/cart/format";
import { sweetnessLabel, wineLineLabel } from "@/lib/cart/labels";
import type { Wine } from "@/lib/schemas";
import { AddWineButton } from "./AddWineToCart";
import { StockStatus } from "./StockStatus";
import { WineImage } from "./WineImage";

/** „Pálava, 2024, polosladké, 0,75 l“. Odrodu vynechá, ak je už v názve vína. */
export function wineMeta(wine: Wine) {
  const variety = wine.name.toLowerCase().includes(wine.variety.toLowerCase()) ? null : wine.variety;
  return [variety, wine.vintage, sweetnessLabel[wine.sweetness], formatVolume(wine.volumeMl)]
    .filter(Boolean)
    .join(", ");
}

export function WineCard({ wine }: { wine: Wine }) {
  const soldOut = wine.stock === 0;
  return (
    <article className="group relative flex w-full flex-col">
      <WineImage
        wine={wine}
        sizes="(min-width: 1024px) 18rem, (min-width: 640px) 30vw, 45vw"
        className={soldOut ? "opacity-60 grayscale" : ""}
      />
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-sm font-bold text-spras-tmava">{wineLineLabel[wine.line]}</p>
        <h3 className="mt-0.5 text-lg leading-tight sm:text-xl">
          {/* Celá karta je klikateľná cez roztiahnutý odkaz; tlačidlo leží nad ním. */}
          {/* prefetch: detail vína je v cache, takže sa načíta ešte pred kliknutím */}
          <Link href={`/e-shop/${wine.slug}`} prefetch className="after:absolute after:inset-0 hover:text-frankovka">
            {wine.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-pivnica-makka">{wineMeta(wine)}</p>
        <div className="mt-auto pt-3">
          <p className="font-display text-xl font-bold text-frankovka tabular-nums">{formatPrice(wine.priceCents)}</p>
          <StockStatus stock={wine.stock} className="mt-0.5" />
          <div className="relative z-10 mt-3">
            <AddWineButton slug={wine.slug} name={wine.name} stock={wine.stock} />
          </div>
        </div>
      </div>
    </article>
  );
}
