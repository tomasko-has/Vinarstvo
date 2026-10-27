import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/** Hlavička vnútornej stránky: drobtinková navigácia, h1, úvodný odsek. Vrstvy spraše dole ako okraj. */
export function PageHeader({
  title,
  lead,
  crumbs,
  children,
}: {
  title: string;
  lead?: ReactNode;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <header className="bg-spras-svetla">
      <Container className="pt-10 pb-12 sm:pt-16 sm:pb-16">
        {crumbs?.length ? (
          <nav aria-label="Drobtinková navigácia" className="mb-6 text-sm text-pivnica-makka">
            <ol className="flex flex-wrap gap-x-2">
              {crumbs.map((c) => (
                <li key={c.href} className="flex gap-x-2">
                  <Link href={c.href} className="underline underline-offset-4 hover:text-frankovka">
                    {c.label}
                  </Link>
                  <span aria-hidden="true">/</span>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="max-w-3xl text-3xl sm:text-4xl">{title}</h1>
        {lead ? <p className="mt-5 max-w-(--container-text) text-lg text-pivnica">{lead}</p> : null}
        {children}
      </Container>
      <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="block h-6 w-full sm:h-10" aria-hidden="true">
        <path d="M0 14C300 4 560 22 860 12C1100 4 1300 16 1440 10V40H0Z" fill="var(--color-spras)" />
        <path d="M0 26C320 18 600 34 900 25C1120 18 1310 28 1440 24V40H0Z" fill="var(--color-spras-tmava)" />
        <path d="M0 35C340 30 620 40 920 34C1140 30 1320 37 1440 34V40H0Z" fill="var(--color-vapno)" />
      </svg>
    </header>
  );
}
