import type { Wine, WineColor, WineLine } from "@/lib/schemas";

// Fľaša s etiketou vytvorenou z dát vína. Každé víno je tak malý plagát:
//   odroda, vinica a ročník sú na etikete, motív a pozadie podľa radu (Ulička / Spraš / Pivnica).
// Kreslené ako dvojfarebná tlač: pod každým tvarom je druhý „atrament“ mierne posunutý.
// Farby sú len z tokenov v app/globals.css.

export type BottleWine = Pick<Wine, "name" | "line" | "color" | "variety" | "vintage" | "vineyard">;

type Box = { x: number; y: number; w: number; h: number };
type Shape = { body: string; capsule: Box; label: Box; foil?: Box };

// Tri tvary: bordeauxská (červené, ružové), štíhla rýnska (biele), hrubšia sektová.
const SHAPES: Record<"standard" | "slender" | "sparkling", Shape> = {
  standard: {
    body: "M137 40h26v78c0 18 35 26 35 62v160a10 10 0 0 1-10 10h-76a10 10 0 0 1-10-10V180c0-36 35-44 35-62Z",
    capsule: { x: 135, y: 38, w: 30, h: 28 },
    label: { x: 110, y: 200, w: 80, h: 112 },
  },
  slender: {
    body: "M138 36h24v112c0 22 28 30 28 66v126a10 10 0 0 1-10 10h-60a10 10 0 0 1-10-10V214c0-36 28-44 28-66Z",
    capsule: { x: 136, y: 34, w: 28, h: 26 },
    label: { x: 117, y: 226, w: 66, h: 100 },
  },
  sparkling: {
    body: "M136 44h28v66c0 30 40 40 40 90v130a14 14 0 0 1-14 14h-80a14 14 0 0 1-14-14V200c0-50 40-60 40-90Z",
    capsule: { x: 134, y: 42, w: 32, h: 12 },
    label: { x: 108, y: 214, w: 84, h: 104 },
    foil: { x: 134, y: 44, w: 32, h: 70 },
  },
};

const GLASS: Record<WineColor, string> = {
  cervene: "var(--color-pivnica)",
  biele: "var(--color-listok)",
  ruzove: "color-mix(in oklab, var(--color-frankovka) 38%, var(--color-vapno))",
  sumive: "color-mix(in oklab, var(--color-listok) 55%, var(--color-pivnica))",
};

const GROUND_Y = 346;

function shapeFor(color: WineColor) {
  return SHAPES[color === "sumive" ? "sparkling" : color === "biele" ? "slender" : "standard"];
}

/** Pozadie podľa radu: svetlá spraš, sýta spraš so zvrstvením, tmavá pivnica. */
function Backdrop({ line }: { line: WineLine }) {
  if (line === "pivnica") {
    return (
      <>
        <rect width="300" height="400" fill="var(--color-pivnica)" />
        <path
          d="M36 400V176a114 114 0 0 1 228 0V400"
          fill="none"
          stroke="var(--color-spras-tmava)"
          strokeWidth="3"
          opacity="0.45"
        />
        <rect y={GROUND_Y} width="300" height={400 - GROUND_Y} fill="color-mix(in oklab, var(--color-pivnica) 70%, black)" />
      </>
    );
  }
  if (line === "spras") {
    return (
      <>
        <rect width="300" height="400" fill="var(--color-spras)" />
        <g fill="none" stroke="var(--color-spras-tmava)" strokeWidth="2" opacity="0.55">
          <path d="M0 96c60-12 120 10 180 0s90-12 120-4" />
          <path d="M0 168c70 10 130-14 190-4s80 8 110 2" />
          <path d="M0 250c50-10 110 8 170 0s90-10 130 0" />
        </g>
        <rect y={GROUND_Y} width="300" height={400 - GROUND_Y} fill="var(--color-spras-tmava)" />
      </>
    );
  }
  return (
    <>
      <rect width="300" height="400" fill="var(--color-spras-svetla)" />
      <rect y={GROUND_Y} width="300" height={400 - GROUND_Y} fill="var(--color-spras)" />
    </>
  );
}

function Emblem({ line, cx, y, ink, accent }: { line: WineLine; cx: number; y: number; ink: string; accent: string }) {
  if (line === "spras") {
    return (
      <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round">
        <path d={`M${cx - 12} ${y + 2}q6-4 12 0t12 0`} />
        <path d={`M${cx - 12} ${y + 9}q6-4 12 0t12 0`} />
        <path d={`M${cx - 12} ${y + 16}q6-4 12 0t12 0`} />
      </g>
    );
  }
  // Ulička a Pivnica: oblúkové dvere, motív celého webu
  return <path d={`M${cx - 7} ${y + 18}V${y + 8}a7 7 0 0 1 14 0v10Z`} fill={accent} />;
}

function Label({ wine, box }: { wine: BottleWine; box: Box }) {
  const dark = wine.line === "pivnica";
  const paper = dark ? "var(--color-pivnica)" : "var(--color-vapno)";
  const ink = dark ? "var(--color-spras-svetla)" : "var(--color-pivnica)";
  const accent = dark ? "var(--color-spras)" : "var(--color-frankovka)";

  // Názov na etikete = prvá odroda; dlhšie názvy sa zalomia na dva riadky
  const title = wine.variety.split(",")[0].trim();
  const words = title.split(" ");
  const lines = words.length > 1 ? [words[0], words.slice(1).join(" ")] : [title];
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.max(9.5, Math.min(17, (box.w - 12) / (longest * 0.54)));
  const overflows = longest * size * 0.54 > box.w - 8;

  const cx = box.x + box.w / 2;
  const titleY = box.y + 54;
  const lineGap = size * 1.12;
  const lastTitleY = titleY + (lines.length - 1) * lineGap;

  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="3" fill={paper} stroke={dark ? accent : "none"} strokeWidth="1.5" />
      <rect x={box.x + 8} y={box.y + 9} width={box.w - 16} height="1.8" fill={ink} />
      <Emblem line={wine.line} cx={cx} y={box.y + 16} ink={ink} accent={accent} />
      {lines.map((text, i) => (
        <text
          key={text}
          x={cx}
          y={titleY + i * lineGap}
          textAnchor="middle"
          fontSize={size}
          fill={ink}
          textLength={overflows ? box.w - 10 : undefined}
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          {text}
        </text>
      ))}
      {wine.vineyard && wine.line !== "ulicka" && (
        <text
          x={cx}
          y={lastTitleY + 14}
          textAnchor="middle"
          fontSize="9.5"
          fill={ink}
          opacity="0.85"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          {wine.vineyard}
        </text>
      )}
      <rect x={box.x + 8} y={box.y + box.h - 26} width={box.w - 16} height="1.8" fill={ink} />
      <text
        x={cx}
        y={box.y + box.h - 9}
        textAnchor="middle"
        fontSize="13"
        fill={accent}
        style={{ fontFamily: "var(--font-sans)", fontWeight: 700, letterSpacing: "0.06em" }}
      >
        {wine.vintage}
      </text>
    </g>
  );
}

export function BottleIllustration({
  wine,
  label,
  className = "",
  bare = false,
}: {
  wine: BottleWine;
  /** Popis pre čítačky obrazovky. */
  label?: string;
  className?: string;
  /** Len fľaša bez pozadia a tieňa, orezaná na jej rozmery (pre kartón, košík a zoznamy). */
  bare?: boolean;
}) {
  const shape = shapeFor(wine.color);
  const dark = wine.line === "pivnica" && !bare;
  const outline = dark ? "var(--color-spras)" : "var(--color-pivnica)";
  const offsetInk = dark ? "var(--color-vapno)" : "var(--color-spras-tmava)";
  const capsule =
    wine.line === "pivnica" ? "var(--color-spras)" : wine.line === "spras" ? "var(--color-frankovka)" : "var(--color-spras-tmava)";

  return (
    <svg
      viewBox={bare ? "84 0 132 356" : "0 0 300 400"}
      preserveAspectRatio={bare ? "xMidYMax meet" : "xMidYMax slice"}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {!bare && <Backdrop line={wine.line} />}
      {!bare && <ellipse cx="150" cy={GROUND_Y} rx="68" ry="5.5" fill={outline} opacity="0.28" />}
      {/* fľaša je o desatinu väčšia než jej kresba, aby vyplnila rám */}
      <g transform={`translate(150 ${GROUND_Y}) scale(1.1) translate(-150 -${GROUND_Y})`}>
      {/* druhý atrament: posunutý tvar, ako pri tlači z dvoch platní */}
      <path d={shape.body} transform="translate(5 4)" fill={offsetInk} opacity={dark ? 0.16 : 0.55} />
      <path d={shape.body} fill={GLASS[wine.color]} stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* odlesk na skle */}
      <rect x="116" y={shape.label.y - 16} width="5" height="120" rx="2.5" fill="var(--color-vapno)" opacity="0.28" />
      {shape.foil && (
        <rect x={shape.foil.x} y={shape.foil.y} width={shape.foil.w} height={shape.foil.h} fill="var(--color-spras)" stroke={outline} strokeWidth="2" />
      )}
      <rect
        x={shape.capsule.x}
        y={shape.capsule.y}
        width={shape.capsule.w}
        height={shape.capsule.h}
        rx="3"
        fill={capsule}
        stroke={outline}
        strokeWidth="2"
      />
      <Label wine={wine} box={shape.label} />
      </g>
    </svg>
  );
}
