// Definícia polí a validácia formulárov (dopyty). Čistá logika bez Reactu, aby sa dala testovať.

export type EnquiryKind = "kontakt" | "degustacia" | "firma" | "ubytovanie";

export type FieldSpec = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "number" | "select" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
};

const name: FieldSpec = { name: "name", label: "Meno a priezvisko", type: "text", required: true, autoComplete: "name" };
const email: FieldSpec = { name: "email", label: "E-mail", type: "email", required: true, autoComplete: "email" };
const phone: FieldSpec = {
  name: "phone",
  label: "Telefón",
  type: "tel",
  autoComplete: "tel",
  hint: "Nepovinné. Hodí sa, ak nás treba zavolať.",
};
const message = (label: string, required = false): FieldSpec => ({ name: "message", label, type: "textarea", required });

export const enquiryFields: Record<EnquiryKind, FieldSpec[]> = {
  kontakt: [name, email, phone, message("Vaša správa", true)],
  degustacia: [
    name,
    email,
    phone,
    {
      name: "tasting",
      label: "Druh degustácie",
      type: "select",
      required: true,
      options: [
        { value: "ulicka", label: "Ochutnávka v pivnici" },
        { value: "stol", label: "Degustácia s jedlom" },
        { value: "pivnica", label: "Archívna degustácia" },
        { value: "skupina", label: "Pre skupinu alebo firmu" },
      ],
    },
    { name: "date", label: "Vhodný dátum", type: "date", required: true },
    { name: "guests", label: "Počet osôb", type: "number", required: true, min: 1, max: 40 },
    message("Niečo, čo máme vedieť (alergie, oslava…)"),
  ],
  firma: [
    name,
    { name: "company", label: "Firma", type: "text", required: true, autoComplete: "organization" },
    email,
    phone,
    {
      name: "quantity",
      label: "Približný počet darčekov",
      type: "select",
      required: true,
      options: [
        { value: "do-20", label: "Do 20 kusov" },
        { value: "20-100", label: "20 až 100 kusov" },
        { value: "100+", label: "Viac ako 100 kusov" },
      ],
    },
    message("Čo potrebujete a dokedy", true),
  ],
  ubytovanie: [
    name,
    email,
    phone,
    { name: "arrival", label: "Príchod", type: "date", required: true },
    { name: "departure", label: "Odchod", type: "date", required: true },
    { name: "guests", label: "Počet osôb", type: "number", required: true, min: 1, max: 12 },
    message("Poznámka"),
  ],
};

export type EnquiryValues = Record<string, string>;
export type EnquiryErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Vráti chyby podľa názvu poľa. Prázdny objekt = formulár je platný. */
export function validateEnquiry(kind: EnquiryKind, values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  for (const f of enquiryFields[kind]) {
    const v = (values[f.name] ?? "").trim();
    if (f.required && !v) {
      errors[f.name] =
        f.type === "select" ? "Vyberte jednu možnosť." : f.type === "date" ? "Vyberte dátum." : `Vyplňte pole „${f.label}“.`;
      continue;
    }
    if (!v) continue;
    if (f.type === "email" && !EMAIL_RE.test(v)) errors[f.name] = "E-mail vyzerá neúplný. Skúste napríklad meno@domena.sk.";
    if (f.type === "tel" && !/^\+?[\d\s()/-]{6,20}$/.test(v)) errors[f.name] = "Telefón zadajte číslami, napríklad +421 900 000 000.";
    if (f.type === "number") {
      const n = Number(v);
      if (!Number.isInteger(n) || n < (f.min ?? 1) || n > (f.max ?? 999)) {
        errors[f.name] = `Zadajte celé číslo od ${f.min ?? 1} do ${f.max ?? 999}.`;
      }
    }
    if (f.name === "name" && v.length < 2) errors[f.name] = "Meno je príliš krátke.";
    if (f.name === "message" && v.length > 2000) errors[f.name] = "Správa je príliš dlhá. Skráťte ju na 2 000 znakov.";
  }
  if (kind === "ubytovanie" && !errors.arrival && !errors.departure && values.arrival && values.departure) {
    if (values.departure <= values.arrival) errors.departure = "Odchod musí byť po dni príchodu.";
  }
  return errors;
}

/** Súhlas so spracovaním údajov je povinný vo všetkých formulároch. */
export const CONSENT_ERROR = "Bez súhlasu so spracovaním údajov dopyt nevieme vybaviť.";
