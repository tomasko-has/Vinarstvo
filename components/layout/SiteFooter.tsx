import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerNav, legalNav } from "@/lib/navigation";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-pivnica text-vapno">
      {/* horný okraj ako vrstvy spraše */}
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="block h-8 w-full sm:h-12" aria-hidden="true">
        <rect width="1440" height="48" fill="var(--color-vapno)" />
        <path d="M0 10C320 22 620 4 900 12C1120 18 1300 8 1440 14V48H0Z" fill="var(--color-spras)" />
        <path d="M0 26C300 36 640 20 940 28C1160 34 1320 24 1440 30V48H0Z" fill="var(--color-spras-tmava)" />
        <path d="M0 38C340 46 660 34 960 40C1180 44 1330 38 1440 41V48H0Z" fill="var(--color-pivnica)" />
      </svg>

      <Container className="grid gap-10 py-12 md:grid-cols-[1.2fr_2fr]">
        <div className="space-y-4">
          <Logo tone="light" />
          <address className="not-italic text-vapno/80">
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
          </address>
          <p className="space-x-4">
            <a href={`tel:${site.phone.replaceAll(" ", "")}`} className="font-bold underline underline-offset-4">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="font-bold underline underline-offset-4">
              {site.email}
            </a>
          </p>
        </div>

        <nav aria-label="Päta" className="grid gap-8 sm:grid-cols-3">
          {footerNav.map((group) => (
            <div key={group.title}>
              <h2 className="mb-3 font-display text-lg font-bold text-spras">{group.title}</h2>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-vapno/85 hover:text-vapno hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 pb-[calc(var(--spacing-tabbar)+1.5rem)] text-sm text-vapno/70 lg:flex-row lg:items-center lg:justify-between lg:pb-6">
          <p>Predaj alkoholu len osobám starším ako 18 rokov.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-vapno hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
