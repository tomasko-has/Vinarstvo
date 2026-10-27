"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";

const items = [
  { href: "/e-shop", label: "Vína" },
  { href: "/e-shop/zostav-si-karton", label: "Zostav si kartón" },
  { href: "/e-shop/mini-sety", label: "Mini-sety" },
  { href: "/e-shop/darcekove-sady", label: "Darčekové sady" },
];

function isCurrent(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/e-shop") {
    // Detail vína patrí pod „Vína“, ostatné sekcie majú vlastnú položku.
    return pathname === href || (pathname.startsWith("/e-shop/") && !items.some((i) => i.href !== href && pathname.startsWith(i.href)));
  }
  return pathname.startsWith(href);
}

function ShopNavInner({ pathname }: { pathname: string | null }) {
  return (
    <ul className="-mx-(--spacing-gutter) flex gap-1 overflow-x-auto px-(--spacing-gutter) [scrollbar-width:none] sm:mx-0 sm:px-0">
      {items.map((item) => {
        const current = isCurrent(pathname, item.href);
        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`relative flex min-h-12 items-center px-3 font-bold whitespace-nowrap transition-colors ${
                current ? "text-frankovka" : "text-pivnica-makka hover:text-pivnica"
              }`}
            >
              {item.label}
              {current && <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-1 rounded-t-full bg-frankovka" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ShopNavActive() {
  return <ShopNavInner pathname={usePathname()} />;
}

/** Podnavigácia e-shopu. usePathname s Cache Components potrebuje Suspense. */
export function ShopNav() {
  return (
    <nav aria-label="E-shop" className="border-b border-vapno-tien">
      <Container>
        <Suspense fallback={<ShopNavInner pathname={null} />}>
          <ShopNavActive />
        </Suspense>
      </Container>
    </nav>
  );
}
