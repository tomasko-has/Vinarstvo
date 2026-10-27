"use client";

/** Množstvo s tlačidlami −/+ (44 px dotykové plochy). */
export function QtyStepper({
  value,
  onChange,
  min = 1,
  max,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Čo sa počíta, pre čítačky: „Množstvo: Frankovka modrá“ */
  label: string;
}) {
  const canDec = value > min;
  const canInc = max === undefined || value < max;
  const button =
    "grid size-11 place-items-center text-xl font-bold text-pivnica transition-colors hover:bg-vapno-tien disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-(--radius-ui) border-2 border-vapno-tien bg-vapno">
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={!canDec} aria-label="Ubrať jeden kus">
        −
      </button>
      <output aria-live="polite" className="min-w-8 text-center font-bold tabular-nums">
        {value}
      </output>
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={!canInc} aria-label="Pridať jeden kus">
        +
      </button>
    </div>
  );
}
