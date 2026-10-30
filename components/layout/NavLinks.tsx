"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/ui/Icon";
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
  return (
    <ul className="grid h-full grid-cols-3">
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
              <Icon name={item.icon} />
              {item.label}
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
