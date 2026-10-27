// Drobné ikony pre mapu a prehrávač (zdieľané Icon z components/ui ich nemá a nemeníme ho).
import type { SVGProps } from "react";

const paths = {
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  locate: "M12 2v3m0 14v3M2 12h3m14 0h3m-4 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  whole: "M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5",
  arrow: "M14 6l6 6-6 6M20 12H4",
  back: "M10 6l-6 6 6 6M4 12h16",
  play: "M7 4.5v15l12.5-7.5L7 4.5Z",
  pause: "M8 5v14M16 5v14",
  prev: "M6 5v14M19 5 9 12l10 7V5Z",
  next: "M18 5v14M5 5l10 7-10 7V5Z",
  download: "M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14",
  check: "M5 12.5 10 17l9-10",
  list: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
} as const;

export type MapIconName = keyof typeof paths;

export function MapIcon({ name, ...props }: { name: MapIconName } & SVGProps<SVGSVGElement>) {
  const filled = name === "play";
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={name === "pause" ? 3 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
