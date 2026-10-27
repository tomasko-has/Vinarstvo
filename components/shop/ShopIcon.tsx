import type { SVGProps } from "react";

// Ikony, ktoré potrebuje len e-shop. Rovnaký štýl ako components/ui/Icon (24 px, ťah 1.75).
const paths = {
  filter: "M4 6h16M7 12h10M10 18h4",
  shuffle: "M16 4h4v4M4 18 20 4M20 16v4h-4M14 14l6 6M4 6l5 5",
  print: "M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7v-7Z",
  check: "M5 12.5 10 17l9-10",
} as const;

export function ShopIcon({ name, ...props }: { name: keyof typeof paths } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
