"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CONSENT_ERROR, type EnquiryErrors, type EnquiryKind, type FieldSpec, enquiryFields, validateEnquiry } from "./forms";

// Odosielanie na server príde vo fáze 2 (e-mail cez Vercel Marketplace). Dovtedy formulár len overí údaje.
const SERVER_SUBMIT_ENABLED = false;

const inputClass =
  "block w-full min-h-11 rounded-(--radius-ui) border-2 border-pivnica/60 bg-white/60 px-3 py-2 text-base text-pivnica " +
  "placeholder:text-pivnica-makka aria-invalid:border-chyba";

function Field({
  spec,
  id,
  error,
  value,
  onChange,
}: {
  spec: FieldSpec;
  id: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const describedBy = [spec.hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: spec.name,
    value,
    required: spec.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    autoComplete: spec.autoComplete,
    className: inputClass,
  } as const;
  return (
    <div className={spec.type === "textarea" ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1 block font-bold">
        {spec.label}
        {spec.required ? null : <span className="font-normal text-pivnica-makka"> (nepovinné)</span>}
      </label>
      {spec.type === "textarea" ? (
        <textarea {...common} rows={5} onChange={(e) => onChange(e.target.value)} />
      ) : spec.type === "select" ? (
        <select {...common} onChange={(e) => onChange(e.target.value)}>
          <option value="">Vyberte…</option>
          {spec.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={spec.type}
          min={spec.type === "number" ? spec.min : undefined}
          max={spec.type === "number" ? spec.max : undefined}
          inputMode={spec.type === "number" ? "numeric" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {spec.hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-pivnica-makka">
          {spec.hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm font-bold text-chyba">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EnquiryForm({
  kind,
  submitLabel = "Odoslať dopyt",
  className = "",
}: {
  kind: EnquiryKind;
  submitLabel?: string;
  className?: string;
}) {
  const uid = useId();
  const fields = enquiryFields[kind];
  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [done, setDone] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Návnada pre roboty: ľudia pole nevidia, takže ho nevyplnia.
    const trap = (new FormData(e.currentTarget).get("web") as string | null) ?? "";
    const found = validateEnquiry(kind, values);
    if (!consent) found.consent = CONSENT_ERROR;
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (!trap && SERVER_SUBMIT_ENABLED) {
      // Fáza 2: odoslanie na server action / API route.
    }
    setDone(true);
    requestAnimationFrame(() => doneRef.current?.focus());
  }

  if (done) {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className={`rounded-(--radius-panel) border-2 border-listok bg-white/60 p-6 ${className}`}
      >
        <h3 className="text-xl">Dopyt je v poriadku vyplnený</h3>
        <p className="mt-3">
          Toto je zatiaľ ukážková verzia formulára. Údaje sme neodoslali a nikde sa neuložili. Napíšte nám prosím na{" "}
          <a href="mailto:pivnica@na-sprasi.sk" className="font-bold text-frankovka underline underline-offset-4">
            pivnica@na-sprasi.sk
          </a>{" "}
          alebo zavolajte, radi vám odpovieme.
        </p>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => {
            setDone(false);
            setValues({});
            setConsent(false);
            setErrors({});
          }}
        >
          Vyplniť znova
        </Button>
      </div>
    );
  }

  const errorList = [
    ...fields.filter((f) => errors[f.name]).map((f) => ({ id: `${uid}-${f.name}`, text: errors[f.name] })),
    ...(errors.consent ? [{ id: `${uid}-consent`, text: errors.consent }] : []),
  ];

  return (
    <form onSubmit={submit} noValidate className={className}>
      {errorList.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-(--radius-panel) border-2 border-chyba bg-white/60 p-4"
        >
          <p className="font-bold text-chyba">Formulár treba ešte opraviť:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorList.map((er) => (
              <li key={er.id}>
                <a href={`#${er.id}`} className="underline underline-offset-4">
                  {er.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <Field
            key={f.name}
            spec={f}
            id={`${uid}-${f.name}`}
            error={errors[f.name]}
            value={values[f.name] ?? ""}
            onChange={(v) => setValues((prev) => ({ ...prev, [f.name]: v }))}
          />
        ))}
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Nevypĺňajte toto pole
          <input type="text" name="web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3">
          <input
            id={`${uid}-consent`}
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${uid}-consent-error` : undefined}
            className="mt-1 size-5 shrink-0 accent-frankovka"
          />
          <span>
            Súhlasím so spracovaním údajov na vybavenie dopytu. Podrobnosti sú v{" "}
            <Link href="/ochrana-osobnych-udajov" className="font-bold text-frankovka underline underline-offset-4">
              zásadách ochrany osobných údajov
            </Link>
            .
          </span>
        </label>
        {errors.consent ? (
          <p id={`${uid}-consent-error`} className="mt-1 text-sm font-bold text-chyba">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="mt-8">
        {submitLabel}
      </Button>
    </form>
  );
}
