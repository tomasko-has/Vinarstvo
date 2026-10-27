import Link from "next/link";
import { site } from "@/lib/site";

// Znak: štít pivnice s oblúkovými dverami (rovnaký motív ako ilustrácia svahu).
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M5 37V14L20 4l15 10v23Z"
        fill="var(--color-vapno)"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M14 37V25a6 6 0 0 1 12 0v12Z" fill="var(--color-frankovka)" />
    </svg>
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "dark" ? "text-pivnica" : "text-vapno";
  return (
    <Link href="/" className={`inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap ${color}`} aria-label={`${site.name}, domov`}>
      <LogoMark className="size-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-sm">Vinárstvo</span>
        <span className="font-display text-xl font-extrabold tracking-tight">{site.shortName}</span>
      </span>
    </Link>
  );
}
