// Čelo pivnice vo sprašovom svahu. Každá pivnica má detail z vlastného príbehu
// (orech, studňa, lis, dva sudy, kríž), ostatné majú rady viniča. Kreslené ako dvojfarebná tlač.

type Prop = "orech" | "lipa" | "studna" | "lis" | "sudy" | "kriz" | "vinic";

const PROPS: Record<string, Prop> = {
  "pod-orechom": "orech",
  lipova: "lipa",
  "pri-studni": "studna",
  "u-stareho-lisu": "lis",
  "u-dvoch-sudov": "sudy",
  krizna: "kriz",
};

const INK = "var(--color-pivnica)";

function Tree({ light = false }: { light?: boolean }) {
  const crown = light ? "color-mix(in oklab, var(--color-listok) 65%, var(--color-vapno))" : "var(--color-listok)";
  return (
    <g>
      <rect x="66" y="168" width="14" height="84" fill="var(--color-pivnica-makka)" />
      <g fill={crown} stroke={INK} strokeWidth="2">
        <circle cx="74" cy="146" r="38" />
        <circle cx="46" cy="168" r="26" />
        <circle cx="102" cy="168" r="26" />
      </g>
      {light && (
        <g fill="var(--color-spras-svetla)">
          <circle cx="60" cy="140" r="4" />
          <circle cx="86" cy="130" r="4" />
          <circle cx="76" cy="160" r="4" />
          <circle cx="98" cy="164" r="4" />
          <circle cx="46" cy="170" r="4" />
        </g>
      )}
    </g>
  );
}

function Well() {
  return (
    <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
      <rect x="300" y="222" width="52" height="30" fill="var(--color-vapno)" />
      <path d="M300 222h52" />
      <rect x="304" y="188" width="5" height="34" fill={INK} />
      <rect x="343" y="188" width="5" height="34" fill={INK} />
      <path d="M296 190 326 170 356 190Z" fill="var(--color-frankovka)" />
      <path d="M326 192v18" />
    </g>
  );
}

function Press() {
  return (
    <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
      <rect x="52" y="236" width="84" height="16" fill="var(--color-pivnica-makka)" />
      <rect x="62" y="190" width="9" height="46" fill="var(--color-spras-tmava)" />
      <rect x="117" y="190" width="9" height="46" fill="var(--color-spras-tmava)" />
      <rect x="56" y="184" width="76" height="9" fill="var(--color-spras-tmava)" />
      <path d="M94 184v-26M80 158h28" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Barrel({ x }: { x: number }) {
  return (
    <g stroke={INK} strokeWidth="2">
      <path d={`M${x} 216q-10 18 0 36h52q10-18 0-36Z`} fill="var(--color-spras-tmava)" />
      <path d={`M${x + 1} 226h50M${x - 1} 242h54`} fill="none" />
    </g>
  );
}

function Cross() {
  return (
    <g fill="var(--color-spras-svetla)" stroke={INK} strokeWidth="2" strokeLinejoin="round">
      <rect x="316" y="180" width="14" height="72" />
      <rect x="302" y="196" width="42" height="14" />
    </g>
  );
}

function Vines() {
  return (
    <g stroke={INK} strokeWidth="2" strokeLinecap="round">
      {[56, 92, 308, 344].map((x) => (
        <g key={x}>
          <path d={`M${x} 252v-48`} />
          <path d={`M${x - 14} 232q14-12 28 0M${x - 14} 214q14-12 28 0`} fill="none" stroke="var(--color-listok)" strokeWidth="5" />
        </g>
      ))}
    </g>
  );
}

export function CellarFront({
  slug,
  className = "",
  label,
}: {
  slug: string;
  className?: string;
  label?: string;
}) {
  const prop: Prop = PROPS[slug] ?? "vinic";
  const ours = slug === "na-sprasi";
  const green = slug === "zeleny-stit";
  const door = ours ? "var(--color-frankovka)" : green ? "var(--color-listok)" : INK;
  const wall = green ? "color-mix(in oklab, var(--color-listok) 42%, var(--color-vapno))" : "var(--color-vapno)";

  const facade = "M125 252V162l75-44 75 44v90Z";
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width="400" height="300" fill="var(--color-spras-svetla)" />
      <path d="M0 150C90 130 200 100 400 88V300H0Z" fill="var(--color-spras)" />
      <g fill="none" stroke="var(--color-spras-tmava)" strokeWidth="2" opacity="0.55">
        <path d="M0 176C100 158 220 128 400 116" />
        <path d="M0 206C120 190 250 168 400 156" />
      </g>
      <rect y="252" width="400" height="48" fill="var(--color-spras-tmava)" />

      {prop === "orech" && <Tree />}
      {prop === "lipa" && <Tree light />}
      {prop === "studna" && <Well />}
      {prop === "lis" && <Press />}
      {prop === "kriz" && <Cross />}
      {prop === "vinic" && <Vines />}

      {/* druhý atrament */}
      <path d={facade} transform="translate(5 4)" fill="var(--color-spras-tmava)" opacity="0.55" />
      <path d={facade} fill={wall} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M115 168 200 114l85 54" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="200" cy="160" r="7" fill={INK} />
      <path d="M173 252v-60a27 27 0 0 1 54 0v60Z" fill={door} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="217" cy="226" r="2.6" fill="var(--color-spras-svetla)" />

      {prop === "sudy" && (
        <>
          <Barrel x={84} />
          <Barrel x={266} />
        </>
      )}
      {ours && (
        <g>
          <path d="M146 196h-24" stroke={INK} strokeWidth="2" />
          <rect x="96" y="196" width="28" height="22" rx="2" fill="var(--color-vapno)" stroke={INK} strokeWidth="2" />
          <path d="M101 205h18M101 211h12" stroke="var(--color-frankovka)" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
