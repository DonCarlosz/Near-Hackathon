import React from 'react';

/**
 * Pixelated Dot-Matrix Microphone Graphic
 * Replaces generic mic emoji with authentic NEAR-style dot grid design
 */
export default function DotMatrixMic({ isListening = false, className = '' }) {
  // 10 cols x 12 rows dot matrix forming a studio microphone
  const matrix = [
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  ];

  return (
    <div className={`inline-grid grid-cols-10 gap-[2px] p-1 ${className}`}>
      {matrix.map((row, rIdx) =>
        row.map((val, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className={`w-[3px] h-[3px] rounded-[0.5px] transition-colors duration-150 ${
              val === 1
                ? isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-[#0047FF]'
                : 'bg-[#DDD5C2]'
            }`}
          />
        ))
      )}
    </div>
  );
}
