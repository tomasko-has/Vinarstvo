import Link from "next/link";
import { WineImage } from "@/components/shop/WineImage";
import { type Wine, wineColorLabel, wineLineLabel } from "@/lib/schemas";
import { formatEur } from "./format";

/** Odkazová karta vína pre obsahové stránky. Nákup rieši e-shop, preto vedie na detail. */
export function WineTile({ wine }: { wine: Wine }) {
  return (
    <li className="group relative flex flex-col">
      <WineImage wine={wine} sizes="(min-width: 768px) 28vw, 80vw" className="mx-auto w-full max-w-64" />
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-sm text-pivnica-makka">
          {wineLineLabel[wine.line]}, {wineColorLabel[wine.color]}, {wine.vintage}
        </p>
        <h3 className="mt-1 text-xl">
          <Link
            href={`/e-shop/${wine.slug}`}
            className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
          >
            {wine.name}
          </Link>
        </h3>
        <p className="mt-2 text-pivnica-makka">{wine.description}</p>
        <p className="mt-auto pt-3 font-bold text-frankovka">{formatEur(wine.priceCents)}</p>
      </div>
    </li>
  );
}
