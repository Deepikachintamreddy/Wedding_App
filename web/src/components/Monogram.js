'use client';

import React from 'react';

export default function Monogram({ className, size = 48, style }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-vn.png"
      alt="VN Monogram"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}
