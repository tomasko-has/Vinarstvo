// Jediný zdroj navigácie pre hlavičku, mobilné menu, spodnú lištu a pätu.

export type NavItem = { href: string; label: string };

export const mainNav: NavItem[] = [
  { href: "/vinarstvo", label: "Vinárstvo" },
  { href: "/mapa", label: "Mapa uličky" },
  { href: "/sprievodca", label: "Sprievodca" },
  { href: "/e-shop", label: "E-shop" },
  { href: "/sluzby/degustacie", label: "Degustácie" },
  { href: "/ubytovanie", label: "Ubytovanie" },
  { href: "/kontakt", label: "Kontakt" },
];

export type TabIcon = "map" | "guide" | "bottle" | "cart";

// Spodná lišta na mobile: to, čo návštevník v uličke potrebuje jednou rukou.
export const tabBar: (NavItem & { icon: TabIcon })[] = [
  { href: "/mapa", label: "Mapa", icon: "map" },
  { href: "/sprievodca", label: "Sprievodca", icon: "guide" },
  { href: "/e-shop", label: "E-shop", icon: "bottle" },
  { href: "/kosik", label: "Košík", icon: "cart" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Vinárstvo",
    items: [
      { href: "/vinarstvo", label: "Náš príbeh" },
      { href: "/vinarstvo/vinice", label: "Naše vinice" },
      { href: "/vinarstvo/galeria", label: "Galéria" },
      { href: "/aktuality", label: "Aktuality" },
    ],
  },
  {
    title: "E-shop",
    items: [
      { href: "/e-shop", label: "Všetky vína" },
      { href: "/e-shop/zostav-si-karton", label: "Zostav si kartón" },
      { href: "/e-shop/mini-sety", label: "Degustačné mini-sety" },
      { href: "/e-shop/darcekove-sady", label: "Darčekové sady" },
    ],
  },
  {
    title: "Navštívte nás",
    items: [
      { href: "/mapa", label: "Mapa uličky" },
      { href: "/sprievodca", label: "Audio sprievodca" },
      { href: "/sluzby/degustacie", label: "Degustácie" },
      { href: "/sluzby/firemne-vina", label: "Firemné vína" },
      { href: "/ubytovanie", label: "Penzión Pri pivnici" },
    ],
  },
];

export const legalNav: NavItem[] = [
  { href: "/obchodne-podmienky", label: "Obchodné podmienky" },
  { href: "/reklamacny-poriadok", label: "Reklamačný poriadok" },
  { href: "/doprava-a-platba", label: "Doprava a platba" },
  { href: "/ochrana-osobnych-udajov", label: "Ochrana osobných údajov" },
  { href: "/cookies", label: "Cookies" },
];

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
