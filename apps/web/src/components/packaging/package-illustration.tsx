import { PACKAGE_TYPE_LABELS, darken } from '@/lib/package-visuals';

function Ground() {
  return <ellipse cx="100" cy="182" rx="62" ry="9" fill="#000" opacity="0.08" />;
}

function Pouch({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <path
        d="M60 60 Q60 40 80 38 L120 38 Q140 40 140 60 L146 150 Q146 172 124 174 L76 174 Q54 172 54 150 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      <line x1="68" y1="70" x2="132" y2="70" stroke={stroke} strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
      <rect x="86" y="42" width="28" height="10" rx="3" fill="#fff" opacity="0.35" />
      <circle cx="132" cy="60" r="4" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.6" />
    </>
  );
}

function Bag({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <path
        d="M62 66 L138 66 L132 168 Q130 176 120 176 L80 176 Q70 176 68 168 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      <path d="M62 66 Q100 50 138 66" fill="none" stroke={stroke} strokeWidth="2.5" />
      <path d="M92 44 Q100 30 108 44" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Sachet({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <rect x="58" y="64" width="84" height="104" rx="6" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <line x1="58" y1="76" x2="142" y2="76" stroke={stroke} strokeWidth="2" opacity="0.5" />
      <line x1="58" y1="156" x2="142" y2="156" stroke={stroke} strokeWidth="2" opacity="0.5" />
      <path d="M58 100 L48 108 L58 116" fill="none" stroke={stroke} strokeWidth="2" opacity="0.7" />
    </>
  );
}

function Bottle({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <path
        d="M84 40 L116 40 L116 58 Q140 70 140 96 L140 160 Q140 176 124 176 L76 176 Q60 176 60 160 L60 96 Q60 70 84 58 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      <rect x="82" y="36" width="36" height="14" rx="3" fill={darken(fill, 30)} stroke={stroke} strokeWidth="2" />
      <rect x="64" y="110" width="72" height="34" rx="2" fill="#fff" opacity="0.55" />
    </>
  );
}

function Tray({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <path d="M50 132 L150 132 L140 172 Q138 178 130 178 L70 178 Q62 178 60 172 Z" fill={fill} stroke={stroke} strokeWidth="2.5" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={66 + i * 18} y1="140" x2={66 + i * 18} y2="170" stroke={stroke} strokeWidth="1.5" opacity="0.35" />
      ))}
      <path
        d="M46 132 Q100 100 154 132 L150 138 Q100 110 50 138 Z"
        fill="#bfe3ff"
        stroke="#7cc3f0"
        strokeWidth="2"
        opacity="0.65"
      />
    </>
  );
}

function Sack({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <path
        d="M70 70 Q64 130 72 160 Q78 178 100 178 Q122 178 128 160 Q136 130 130 70 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      <path d="M84 40 Q100 60 116 40" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      <path d="M90 34 L110 46 M110 34 L90 46" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      {[86, 100, 114].map((x, i) => (
        <path key={i} d={`M${x} 78 Q${x - 6} 120 ${x} 160`} fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.35" />
      ))}
      {[95, 118, 141].map((y, i) => (
        <path key={i} d={`M72 ${y} Q100 ${y + 8} 128 ${y}`} fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.35" />
      ))}
    </>
  );
}

function Carton({ fill, stroke }: { fill: string; stroke: string }) {
  const edge = darken(fill, 24);
  return (
    <>
      <Ground />
      <rect x="52" y="76" width="96" height="98" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <path d="M52 76 L68 60 L164 60 L148 76 Z" fill={edge} stroke={stroke} strokeWidth="2" />
      <path d="M148 76 L164 60 L164 158 L148 174 Z" fill={darken(fill, 12)} stroke={stroke} strokeWidth="2" />
      <line x1="100" y1="76" x2="100" y2="174" stroke={stroke} strokeWidth="2" opacity="0.55" />
      <rect x="86" y="76" width="28" height="98" fill="#c9822f" opacity="0.55" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1="148" y1={64 + i * 15} x2="164" y2={64 + i * 15} stroke={stroke} strokeWidth="1" opacity="0.3" />
      ))}
    </>
  );
}

function Crate({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <rect x="48" y="82" width="104" height="90" rx="4" fill={fill} stroke={stroke} strokeWidth="2.5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="54" y1={94 + i * 15} x2="146" y2={94 + i * 15} stroke={stroke} strokeWidth="2" opacity="0.4" />
      ))}
      <rect x="48" y="82" width="12" height="90" fill={darken(fill, 20)} opacity="0.6" />
      <rect x="140" y="82" width="12" height="90" fill={darken(fill, 20)} opacity="0.6" />
      <ellipse cx="70" cy="98" rx="7" ry="4" fill="none" stroke={stroke} strokeWidth="2" />
      <ellipse cx="130" cy="98" rx="7" ry="4" fill="none" stroke={stroke} strokeWidth="2" />
    </>
  );
}

function JerryCan({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <rect x="56" y="66" width="88" height="106" rx="10" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <rect x="82" y="46" width="20" height="22" rx="4" fill={darken(fill, 15)} stroke={stroke} strokeWidth="2" />
      <rect x="86" y="38" width="12" height="10" rx="2" fill={darken(fill, 25)} stroke={stroke} strokeWidth="1.8" />
      <path d="M104 50 Q126 50 126 70 L126 90" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      {[86, 106, 126].map((y, i) => (
        <line key={i} x1="62" y1={y} x2="138" y2={y} stroke={stroke} strokeWidth="1.5" opacity="0.3" />
      ))}
    </>
  );
}

function MilkCan({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <path d="M66 78 L134 78 L128 170 L72 170 Z" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <path d="M72 78 Q100 68 128 78 L134 78 Q100 60 66 78 Z" fill={darken(fill, 15)} stroke={stroke} strokeWidth="2" />
      <ellipse cx="100" cy="60" rx="16" ry="7" fill={darken(fill, 20)} stroke={stroke} strokeWidth="2" />
      <path d="M70 92 Q54 96 58 110 Q60 118 72 116" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M130 92 Q146 96 142 110 Q140 118 128 116" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

function Drum({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <rect x="60" y="54" width="80" height="120" rx="6" fill={fill} stroke={stroke} strokeWidth="2.5" />
      {[64, 108, 148].map((y, i) => (
        <rect key={i} x="58" y={y} width="84" height="6" fill={darken(fill, 22)} opacity="0.7" />
      ))}
      <circle cx="86" cy="60" r="6" fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx="114" cy="60" r="6" fill="none" stroke={stroke} strokeWidth="2" />
    </>
  );
}

function JumboBag({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <>
      <Ground />
      <path
        d="M58 68 Q54 130 62 158 Q66 176 100 176 Q134 176 138 158 Q146 130 142 68 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      <rect x="88" y="44" width="24" height="24" rx="4" fill={darken(fill, 20)} stroke={stroke} strokeWidth="2" />
      {[[62, 50], [138, 50]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y + 10} Q${x} ${y - 8} ${x + (i === 0 ? 14 : -14)} ${y - 8}`} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <line x1={x + (i === 0 ? 8 : -8)} y1={y + 2} x2={i === 0 ? 76 : 124} y2="72" stroke={stroke} strokeWidth="2.5" />
        </g>
      ))}
      {[78, 100, 122].map((x, i) => (
        <path key={i} d={`M${x} 72 Q${x - (i === 1 ? 0 : 4)} 122 ${x} 172`} fill="none" stroke={stroke} strokeWidth="1.3" opacity="0.35" />
      ))}
    </>
  );
}

const RENDERERS: Record<string, (props: { fill: string; stroke: string }) => React.ReactElement> = {
  pouch: Pouch,
  bag: Bag,
  sachet: Sachet,
  bottle: Bottle,
  tray: Tray,
  sack: Sack,
  carton: Carton,
  crate: Crate,
  jumbo_bag: JumboBag,
  jerry_can: JerryCan,
  milk_can: MilkCan,
  drum: Drum,
};

/**
 * A hand-drawn, flat-illustration-style stand-in for a real product photo —
 * this session has no image-generation tool available, so this is the most
 * faithful "looks like the actual object, not a generic box" static visual
 * achievable here. Shape + a couple of structural details (weave lines on a
 * sack, flap lines on a carton, slats on a crate, loops on a jumbo bag) per
 * package type, colored by the outer material.
 */
export function PackageIllustration({
  structureType,
  outerColor,
}: {
  structureType: string;
  outerColor: string;
}) {
  const Renderer = RENDERERS[structureType] ?? Bag;
  const stroke = darken(outerColor, 70);
  const label = PACKAGE_TYPE_LABELS[structureType] ?? 'Package';

  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-gradient-to-b from-secondary/50 to-secondary/10 py-4">
      <svg viewBox="0 0 200 200" className="h-56 w-56" role="img" aria-label={label}>
        <Renderer fill={outerColor} stroke={stroke} />
      </svg>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
