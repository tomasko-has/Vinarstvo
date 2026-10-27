import type { ReactNode } from "react";

/** Súvislý text s čitateľnou šírkou riadku. */
export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-(--container-text) space-y-5 text-base [&_a]:text-frankovka [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:text-xl [&_h3]:mt-8 [&_h3]:text-lg [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2 ${className}`}
    >
      {children}
    </div>
  );
}

/** Odseky oddelené prázdnym riadkom (formát `body` v aktualitách). */
export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((p) => (
        <p key={p}>{p}</p>
      ))}
    </>
  );
}
