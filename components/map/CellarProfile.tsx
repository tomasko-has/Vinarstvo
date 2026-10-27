"use client";

// Profil pivnice v bočnom paneli (desktop) alebo bottom sheete (mobil).
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { navigationUrl } from "@/lib/geo/navigation";
import type { Cellar } from "@/lib/schemas";
import { OpenStatus, WeekHours } from "./CellarHours";
import { MapIcon } from "./icons";
import { featuresText } from "./labels";

export type WineLink = { slug: string; name: string };

export function CellarProfile({
  cellar,
  wines,
  onClose,
}: {
  cellar: Cellar;
  wines: WineLink[];
  onClose: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [cellar.slug]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="profil-nazov"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="flex max-h-full flex-col"
    >
      {/* úchyt bottom sheetu */}
      <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-spras-tmava/40 lg:hidden" aria-hidden="true" />
      <div className="flex items-start gap-4 px-5 pt-3 pb-4 lg:px-6 lg:pt-6">
        <ArchFrame ratio="3/4" className="w-16 shrink-0 lg:w-20">
          <Image src={cellar.image.src} alt={cellar.image.alt} fill unoptimized className="object-cover" />
        </ArchFrame>
        <div className="min-w-0 flex-1 pt-1">
          <h2
            id="profil-nazov"
            ref={heading}
            tabIndex={-1}
            className={`text-xl leading-tight outline-none ${cellar.isOurs ? "text-frankovka" : ""}`}
          >
            {cellar.name}
          </h2>
          <p className="mt-0.5 text-sm text-pivnica-makka">{cellar.owner}</p>
          <OpenStatus hours={cellar.openingHours} className="mt-2 text-sm" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-pivnica hover:bg-vapno-tien"
        >
          <Icon name="close" />
          <span className="sr-only">Zavrieť profil</span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 lg:px-6">
        <p className="text-base">{cellar.story}</p>
        {cellar.features.length > 0 && <p className="mt-3 text-sm text-pivnica-makka">{featuresText(cellar.features)}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href={navigationUrl(cellar.gps)} target="_blank" rel="noopener" size="md">
            <Icon name="pin" />
            Navigovať
          </ButtonLink>
          {cellar.phone && (
            <ButtonLink href={`tel:${cellar.phone.replace(/\s/g, "")}`} variant="secondary">
              <Icon name="phone" />
              Zavolať
            </ButtonLink>
          )}
        </div>

        {cellar.isOurs && wines.length > 0 && (
          <section className="mt-6" aria-labelledby="profil-vina">
            <h3 id="profil-vina" className="text-lg">
              Čo u nás nalievame
            </h3>
            <ul className="mt-2 divide-y divide-vapno-tien border-y border-vapno-tien">
              {wines.slice(0, 5).map((w) => (
                <li key={w.slug}>
                  <Link href={`/e-shop/${w.slug}`} className="flex min-h-11 items-center justify-between gap-3 py-2 hover:text-frankovka">
                    {w.name}
                    <MapIcon name="arrow" className="size-4 shrink-0 text-spras-tmava" />
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href="/e-shop" variant="quiet" className="mt-1">
              Všetky vína v e-shope ({wines.length})
            </ButtonLink>
          </section>
        )}

        <details className="group mt-6">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-bold">
            Otváracie hodiny
            <MapIcon name="plus" className="size-5 transition-transform group-open:rotate-45" />
          </summary>
          <div className="pt-1 pb-2">
            <WeekHours hours={cellar.openingHours} />
          </div>
        </details>

        <Link
          href={`/mapa/${cellar.slug}`}
          className="mt-2 inline-flex min-h-11 items-center gap-2 font-bold text-frankovka underline decoration-2 underline-offset-4"
        >
          Celý profil pivnice
        </Link>
      </div>
    </div>
  );
}
