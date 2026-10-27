import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Vollkorn } from "next/font/google";
import { MobileTabBar } from "@/components/layout/NavLinks";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { site } from "@/lib/site";
import "./globals.css";

const vollkorn = Vollkorn({
  variable: "--font-vollkorn",
  subsets: ["latin", "latin-ext"],
});

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  // Next nemá pre tento font metriky náhradného písma, preto vlastný fallback
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Rodinné vinárstvo v Sprašovej uličke. Vína z vlastných viníc, kartóny na mieru, degustačné mini-sety a audio sprievodca uličkou pivníc.",
  applicationName: site.name,
};

export const viewport: Viewport = {
  themeColor: "#f1f2ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className={`${vollkorn.variable} ${atkinson.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-(--spacing-tabbar) lg:pb-0">
        <a
          href="#obsah"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-(--radius-ui) focus:bg-frankovka focus:px-4 focus:py-2 focus:text-vapno"
        >
          Preskočiť na obsah
        </a>
        <SiteHeader />
        <main id="obsah" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileTabBar />
      </body>
    </html>
  );
}
