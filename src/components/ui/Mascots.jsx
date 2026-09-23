import React from 'react';

/* Original mascots — simple, friendly, built from basic shapes. */

export function DinoMascot({ size = 96, mood = 'happy' }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="Dino">
      <ellipse cx="58" cy="74" rx="34" ry="30" fill="#43C489" />
      <ellipse cx="60" cy="84" rx="20" ry="15" fill="#D9F8EA" />
      <path d="M40 52 L47 34 L54 52 Z" fill="#2FA871" />
      <path d="M54 48 L62 30 L69 48 Z" fill="#2FA871" />
      <path d="M68 50 L76 34 L82 52 Z" fill="#2FA871" />
      <ellipse cx="34" cy="84" rx="10" ry="8" fill="#43C489" />
      <rect x="42" y="96" width="14" height="16" rx="7" fill="#2FA871" />
      <rect x="64" y="96" width="14" height="16" rx="7" fill="#2FA871" />
      <circle cx="80" cy="44" r="26" fill="#43C489" />
      <ellipse cx="96" cy="52" rx="14" ry="11" fill="#56D69C" />
      <circle cx="74" cy="38" r="9" fill="#fff" />
      <circle cx="76" cy="39" r="4.5" fill="#232741" />
      <circle cx="77.5" cy="37" r="1.6" fill="#fff" />
      <circle cx="92" cy="36" r="7" fill="#fff" />
      <circle cx="93" cy="37" r="3.6" fill="#232741" />
      <ellipse cx="103" cy="49" rx="2.2" ry="1.6" fill="#232741" />
      <path
        d={mood === 'happy' ? 'M96 58 q6 5 12 0' : 'M96 60 q6 -4 12 0'}
        stroke="#232741"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="70" cy="54" r="4" fill="#FF9A8A" opacity="0.55" />
    </svg>
  );
}

export function LunaMascot({ size = 96 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="Luna">
      <path d="M28 46 L34 16 L56 36 Z" fill="#FF9A5C" />
      <path d="M92 46 L86 16 L64 36 Z" fill="#FF9A5C" />
      <path d="M34 42 L37 24 L50 36 Z" fill="#FFD9BE" />
      <path d="M86 42 L83 24 L70 36 Z" fill="#FFD9BE" />
      <circle cx="60" cy="62" r="38" fill="#FFA76B" />
      <ellipse cx="60" cy="74" rx="24" ry="18" fill="#FFF3E8" />
      <ellipse cx="60" cy="64" rx="30" ry="26" fill="#FFB87C" />
      <circle cx="48" cy="58" r="7" fill="#fff" />
      <circle cx="49" cy="59" r="3.6" fill="#232741" />
      <circle cx="72" cy="58" r="7" fill="#fff" />
      <circle cx="73" cy="59" r="3.6" fill="#232741" />
      <ellipse cx="60" cy="70" rx="5" ry="4" fill="#232741" />
      <path
        d="M55 78 q5 5 10 0"
        stroke="#232741"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="40" cy="70" r="4.5" fill="#FF7A8A" opacity="0.5" />
      <circle cx="80" cy="70" r="4.5" fill="#FF7A8A" opacity="0.5" />
    </svg>
  );
}

export function NovaMascot({ size = 96 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="Nova">
      <path
        d="M60 10 L72 44 L108 46 L79 68 L90 104 L60 82 L30 104 L41 68 L12 46 L48 44 Z"
        fill="#FFD34E"
        stroke="#F5B93A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="56" r="7" fill="#fff" />
      <circle cx="49" cy="57" r="3.6" fill="#232741" />
      <circle cx="72" cy="56" r="7" fill="#fff" />
      <circle cx="73" cy="57" r="3.6" fill="#232741" />
      <path
        d="M52 70 q8 8 16 0"
        stroke="#232741"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="42" cy="68" r="4.5" fill="#FF8A57" opacity="0.55" />
      <circle cx="78" cy="68" r="4.5" fill="#FF8A57" opacity="0.55" />
      <circle cx="34" cy="34" r="4" fill="#fff" opacity="0.9" />
      <circle cx="92" cy="30" r="3" fill="#fff" opacity="0.8" />
    </svg>
  );
}

export function MiloMascot({ size = 96 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="Milo">
      <circle cx="34" cy="34" r="16" fill="#B47B50" />
      <circle cx="86" cy="34" r="16" fill="#B47B50" />
      <circle cx="34" cy="34" r="9" fill="#E8B58C" />
      <circle cx="86" cy="34" r="9" fill="#E8B58C" />
      <circle cx="60" cy="62" r="40" fill="#C8956C" />
      <ellipse cx="60" cy="74" rx="22" ry="17" fill="#F3D8BC" />
      <circle cx="46" cy="56" r="7" fill="#fff" />
      <circle cx="47" cy="57" r="3.6" fill="#232741" />
      <circle cx="74" cy="56" r="7" fill="#fff" />
      <circle cx="75" cy="57" r="3.6" fill="#232741" />
      <ellipse cx="60" cy="68" rx="6" ry="4.5" fill="#232741" />
      <path
        d="M54 78 q6 6 12 0"
        stroke="#232741"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="38" cy="70" r="4.5" fill="#FF7A8A" opacity="0.45" />
      <circle cx="82" cy="70" r="4.5" fill="#FF7A8A" opacity="0.45" />
    </svg>
  );
}

const MAP = {
  dino: DinoMascot,
  luna: LunaMascot,
  nova: NovaMascot,
  milo: MiloMascot,
};

export function Mascot({ id = 'dino', size = 96, ...rest }) {
  const C = MAP[id] || DinoMascot;
  return <C size={size} {...rest} />;
}

export function Logo({ size = 42 }) {
  return (
    <span className="logo">
      <span className="logo__mark" style={{ width: size, height: size }} aria-hidden="true">
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path d="M3 5c3.5-1.6 6-1.6 9 0v14c-3-1.6-5.5-1.6-9 0V5z" fill="#fff" />
          <path d="M21 5c-3.5-1.6-6-1.6-9 0v14c3-1.6 5.5-1.6 9 0V5z" fill="#FFE7D6" />
        </svg>
      </span>
      Readly
    </span>
  );
}
