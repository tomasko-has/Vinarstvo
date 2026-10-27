// Rez sprašovým svahom s vykopanými pivnicami — hlavný vizuálny motív webu.
// Pivnice sú vpravo; na úzkych displejoch sa ilustrácia orezáva zľava (xMax), aby ostali viditeľné.

const GROUND = 520;
const GABLE = 30;
const EAVE = 10; // presah strechy

// x, šírka, výška čela; `ours` = naša pivnica (dvere vo farbe frankovky)
// Čelá pivníc sú nízke a široké, zarezané do svahu.
const cellars = [
  { x: 640, w: 150, h: 118 },
  { x: 812, w: 170, h: 134 },
  { x: 1004, w: 150, h: 122 },
  { x: 1176, w: 180, h: 142, ours: true },
  { x: 1378, w: 150, h: 120 },
];

function facade({ x, w, h }: { x: number; w: number; h: number }) {
  const top = GROUND - h;
  return `M${x} ${GROUND}V${top + GABLE}L${x + w / 2} ${top}L${x + w} ${top + GABLE}V${GROUND}Z`;
}

function roof({ x, w, h }: { x: number; w: number; h: number }) {
  const top = GROUND - h;
  const slope = GABLE / (w / 2);
  return `M${x - EAVE} ${top + GABLE + EAVE * slope}L${x + w / 2} ${top - 4}L${x + w + EAVE} ${top + GABLE + EAVE * slope}`;
}

function door({ x, w, h }: { x: number; w: number; h: number }) {
  const dw = Math.round(w * 0.34);
  const dh = Math.round(h * 0.62);
  const dx = x + (w - dw) / 2;
  const r = dw / 2;
  return `M${dx} ${GROUND}V${GROUND - dh + r}A${r} ${r} 0 0 1 ${dx + dw} ${GROUND - dh + r}V${GROUND}Z`;
}

export function LoessSlope({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 560"
      preserveAspectRatio="xMaxYMax slice"
      className={className}
      role="img"
      aria-label="Sprašový svah s piatimi vínnymi pivnicami, jedna má vínovočervené dvere"
    >
      {/* vrstvy spraše */}
      <path
        d="M0 300C240 270 420 222 640 190C900 152 1150 112 1440 92V560H0Z"
        fill="var(--color-spras-svetla)"
      />
      <path
        d="M0 362C260 338 470 302 700 282C960 258 1180 232 1440 218V560H0Z"
        fill="var(--color-spras)"
      />
      <path
        d="M0 420C300 404 520 386 760 373C1000 361 1220 351 1440 346V560H0Z"
        fill="var(--color-spras-tmava)"
      />
      <path
        d="M0 440C300 425 520 408 760 396C1000 385 1220 376 1440 372V560H0Z"
        fill="var(--color-spras)"
      />
      {/* jemné vrstvenie */}
      <g fill="none" stroke="var(--color-spras-tmava)" strokeWidth="1.5" opacity="0.45">
        <path d="M0 330C250 304 450 266 670 238C930 206 1160 176 1440 158" />
        <path d="M0 392C280 372 500 344 730 328C980 310 1200 292 1440 282" />
        <path d="M0 476C300 466 540 452 780 444C1010 437 1230 431 1440 428" />
      </g>
      {/* ulička */}
      <path d={`M0 ${GROUND}H1440V560H0Z`} fill="var(--color-spras-tmava)" />
      <path
        d={`M0 ${GROUND + 14}C360 ${GROUND + 10} 900 ${GROUND + 18} 1440 ${GROUND + 12}`}
        fill="none"
        stroke="var(--color-spras)"
        strokeWidth="2"
        opacity="0.6"
      />
      {/* čelá pivníc */}
      {cellars.map((c) => (
        <g key={c.x}>
          <path d={facade(c)} fill="var(--color-vapno)" />
          <path
            d={roof(c)}
            fill="none"
            stroke="var(--color-pivnica)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d={door(c)} fill={c.ours ? "var(--color-frankovka)" : "var(--color-pivnica)"} />
        </g>
      ))}
    </svg>
  );
}
