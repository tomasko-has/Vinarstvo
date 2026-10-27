import type { ComponentPropsWithoutRef, ElementType } from "react";

type ContainerProps<T extends ElementType> = {
  as?: T;
  /** "site" = šírka webu, "text" = čitateľná šírka textu (~70 znakov) */
  width?: "site" | "text";
} & ComponentPropsWithoutRef<T>;

export function Container<T extends ElementType = "div">({
  as,
  width = "site",
  className = "",
  ...props
}: ContainerProps<T>) {
  const Tag = as ?? "div";
  const max = width === "text" ? "max-w-(--container-text)" : "max-w-(--container-site)";
  return <Tag className={`mx-auto w-full px-(--spacing-gutter) sm:px-6 ${max} ${className}`} {...props} />;
}
