"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { mainNav } from "@/lib/navigation";
import { site } from "@/lib/site";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobilne-menu"
        className="inline-flex min-h-11 items-center gap-2 rounded-(--radius-ui) px-3 font-bold text-pivnica hover:bg-vapno-tien xl:hidden"
      >
        <Icon name="menu" />
        Menu
      </button>

      {open && (
        <div
          id="mobilne-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-pivnica text-vapno"
        >
          <div className="flex items-center justify-end px-(--spacing-gutter) py-3">
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center gap-2 rounded-(--radius-ui) px-3 font-bold hover:bg-white/10"
            >
              <Icon name="close" />
              Zavrieť
            </button>
          </div>
          <nav aria-label="Hlavná navigácia" className="px-(--spacing-gutter) pb-8">
            <ul className="flex flex-col">
              {mainNav.map((item) => (
                <li key={item.href} className="border-b border-white/10">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-display text-2xl font-extrabold hover:text-spras"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto space-y-1 px-(--spacing-gutter) pb-[calc(var(--spacing-tabbar)+1.5rem)] text-vapno/80">
            <p>
              {site.lane}, {site.address.city}
            </p>
            <p>
              <a href={`tel:${site.phone.replaceAll(" ", "")}`} className="font-bold text-vapno underline underline-offset-4">
                {site.phone}
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
