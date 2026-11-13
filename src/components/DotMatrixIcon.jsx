import React from 'react';

/**
 * Authentic 10x8 Dot Matrix Icon matching nearhackathon.com
 * Inactive dots render in subtle beige/tan (#E1D9C8) to form the textured pixel grid.
 * Active dots render in #111111 (near black) and #0047FF (electric blue).
 */
export default function DotMatrixIcon({ type = 'arrows', className = '' }) {
  // 10 cols x 8 rows
  // 1 = active dark/blue, 2 = active secondary, 0 = inactive background dot
  const patterns = {
    // 01 / DFI: Opposing trading / feed arrows (Exact match to nearhackathon.com card 1)
    arrows: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    // 02 / INV: Rising bar chart (Exact match to nearhackathon.com card 2)
    bars: [
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 1, 0, 1, 0, 1, 0, 1, 0],
      [1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
    ],
    // 03 / PRV: Padlock / Private by design (Exact match to nearhackathon.com card 3)
    lock: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
    // 04 / API: Cloud & weather forecast
    weather: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    // 05 / DGT: News document
    news: [
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    // 06 / DTA: Historical dataset cylinder
    dataset: [
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  };

  const grid = patterns[type] || patterns.arrows;

  return (
    <div className={`inline-grid grid-cols-10 gap-[2.5px] p-0.5 ${className}`}>
      {grid.map((row, rIdx) =>
        row.map((val, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className={`w-[4px] h-[4px] rounded-[0.5px] transition-colors duration-150 ${
              val === 1
                ? 'bg-[#111111]'
                : val === 2
                ? 'bg-[#0047FF]'
                : 'bg-[#DDD5C2]'
            }`}
          />
        ))
      )}
    </div>
  );
}
