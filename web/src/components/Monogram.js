'use client';

import React from 'react';

export default function Monogram({ className = '', size = 48, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
      aria-label="Elysian Concierge Crest"
    >
      <defs>
        <linearGradient id="elysianGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E6BE" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>
        <linearGradient id="elysianGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#AA7C11" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Subtle outer diamond ring */}
      <circle cx="50" cy="50" r="46" stroke="url(#elysianGold)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="50" cy="50" r="42" stroke="url(#elysianGold)" strokeWidth="1" opacity="0.8" />

      {/* Decorative Crown / Arch Tops */}
      <path
        d="M36 30 C42 22, 58 22, 64 30 M50 20 L50 25 M38 23 L42 27 M62 23 L58 27"
        stroke="url(#elysianGold)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Interlocking Monogram E and C */}
      {/* Letter E */}
      <path
        d="M38 34 L38 66 M38 34 L54 34 M38 50 L48 50 M38 66 L54 66"
        stroke="url(#elysianGold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter C interlaced */}
      <path
        d="M62 40 C56 34, 46 36, 44 48 C42 60, 52 66, 62 62"
        stroke="url(#elysianGold)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Small accent diamond at center base */}
      <polygon points="50,72 53,75 50,78 47,75" fill="url(#elysianGold)" />
    </svg>
  );
}
