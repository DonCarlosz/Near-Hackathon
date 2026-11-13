import React from 'react';

/**
 * Authentic NEAR Hackathon Dot Matrix Logo
 * Replaces the emoji with the signature pixelated dot-matrix "N" graphic
 * seen on the official nearhackathon.com navbar.
 */
export default function NearDotLogo({ className = '' }) {
  // 10x10 dot matrix forming the signature NEAR "N"
  // 1 = active blue dot, 0 = subtle inactive dot
  const matrix = [
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 1, 1, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
  ];

  return (
    <div className={`inline-grid grid-cols-10 gap-[2px] p-0.5 ${className}`}>
      {matrix.map((row, rIdx) =>
        row.map((val, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className={`w-[2.5px] h-[2.5px] rounded-[0.5px] transition-colors ${
              val === 1
                ? 'bg-[#0047FF]'
                : 'bg-[#DDD5C2]'
            }`}
          />
        ))
      )}
    </div>
  );
}
