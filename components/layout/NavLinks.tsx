"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/ui/Icon";
import { useCartCount } from "@/lib/cart/store";
import { isActive, mainNav, tabBar } from "@/lib/navigation";

// usePathname s Cache Components potrebuje Suspense. Fallback je rovnaká navigácia bez zvýraznenia.

function DesktopNavInner({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-1">
      {mainNav.map((item) => {
        const active = pathname ? isActive(pathname, item.href) : false;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-(--radius-ui) px-2.5 py-2 font-bold whitespace-nowrap transition-colors hover:bg-vapno-tien ${
                active ? "text-frankovka" : "text-pivnica"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function DesktopNavActive() {
  return <DesktopNavInner pathname={usePathname()} />;
}

export function DesktopNav() {
  return (
    <nav aria-label="Hlavná navigácia">
      <Suspense fallback={<DesktopNavInner pathname={null} />}>
        <DesktopNavActive />
      </Suspense>
    </nav>
  );
}

function TabBarInner({ pathname }: { pathname: string | null }) {
  const count = useCartCount();
  return (
    <ul className="grid h-full grid-cols-4">
      {tabBar.map((item) => {
        const active = pathname ? isActive(pathname, item.href) : false;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-full flex-col items-center justify-center gap-0.5 text-sm font-bold ${
                active ? "text-spras" : "text-vapno"
              }`}
            >
              {active && <span className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-spras" aria-hidden="true" />}
              <span className="relative">
                <Icon name={item.icon} />
                {item.icon === "cart" && count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 grid min-w-5 place-items-center rounded-full bg-spras px-1 text-xs leading-5 text-pivnica">
                    {count}
                  </span>
                )}
              </span>
              {item.label}
              {item.icon === "cart" && count > 0 && <span className="sr-only">, položiek: {count}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function TabBarActive() {
  return <TabBarInner pathname={usePathname()} />;
}

export function MobileTabBar() {
  return (
    <nav
      aria-label="Rýchla navigácia"
      className="fixed inset-x-0 bottom-0 z-40 h-(--spacing-tabbar) bg-pivnica pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <Suspense fallback={<TabBarInner pathname={null} />}>
        <TabBarActive />
      </Suspense>
    </nav>
  );
}

export function CartLink() {
  const count = useCartCount();
  return (
    <Link
      href="/kosik"
      className="inline-flex min-h-11 items-center gap-2 rounded-(--radius-ui) px-3 font-bold text-pivnica hover:bg-vapno-tien"
    >
      <Icon name="cart" />
      Košík
      {count > 0 && (
        <span className="grid min-w-6 place-items-center rounded-full bg-frankovka px-1.5 text-sm leading-6 text-vapno">
          {count}
          <span className="sr-only"> položiek</span>
        </span>
      )}
    </Link>
  );
}
