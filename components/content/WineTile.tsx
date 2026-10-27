import Image from "next/image";
import Link from "next/link";
import { type Wine, wineColorLabel, wineLineLabel } from "@/lib/schemas";
import { formatEur } from "./format";

/** Odkazová karta vína pre obsahové stránky. Nákup rieši e-shop, preto vedie na detail. */
export function WineTile({ wine }: { wine: Wine }) {
  const img = wine.images[0];
  return (
    <li className="group relative flex gap-5 border-t-2 border-pivnica/80 pt-5">
      {img ? <Image src={img.src} alt="" width={72} height={200} className="h-32 w-auto shrink-0" /> : null}
      <div className="flex flex-1 flex-col">
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
