import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-bold rounded-(--radius-ui) transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-50 min-h-11";

const variants: Record<Variant, string> = {
  primary: "bg-frankovka text-vapno hover:bg-frankovka-hover",
  secondary: "border-2 border-pivnica text-pivnica hover:bg-pivnica hover:text-vapno",
  quiet: "text-frankovka underline decoration-2 underline-offset-4 hover:decoration-spras-tmava",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

function classes(variant: Variant, size: Size, className = "") {
  const padding = variant === "quiet" ? "px-0 py-2" : sizes[size];
  return `${base} ${variants[variant]} ${padding} ${className}`;
}

type Common = { variant?: Variant; size?: Size };

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: Common & ComponentPropsWithoutRef<"button">) {
  return <button type={type} className={classes(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Common & ComponentPropsWithoutRef<typeof Link>) {
  return <Link className={classes(variant, size, className)} {...props} />;
}
