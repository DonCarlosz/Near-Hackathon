import React from 'react';
import { useVoiceLeash } from '../context/VoiceLeashContext';

export default function Hero() {
  const { setActiveTab } = useVoiceLeash();

  return (
    <div className="pt-6 pb-12">
      {/* 01 / BUILD DIRECTIONS / Category Header */}
      <div className="font-mono text-[11px] font-bold text-[#0047FF] tracking-[0.08em] uppercase mb-3.5">
        01 / PERSONAL SHOPPER
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        {/* Massive Dual-Tone Heading */}
        <div className="lg:col-span-8">
          <h1 className="text-[2.75rem] sm:text-[3.5rem] md:text-[4.25rem] font-extrabold uppercase tracking-[-0.03em] leading-[0.92] text-[#111111]">
            YOUR AI AGENT’S<br />
            <span className="text-[#0047FF]">PERSONAL SHOPPER</span>
          </h1>
        </div>

        {/* Monospace Right-Side Copy (Aligned over Column 3) */}
        <div className="lg:col-span-4 font-mono text-[12.5px] sm:text-[13px] text-[#555] leading-[1.65] space-y-0.5">
          <p>Set spending rules in plain language.</p>
          <p>Watch your agent shop. Safe on NEAR.</p>
          <div className="pt-2 flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setActiveTab('control')}
              className="text-[#0047FF] hover:underline font-bold uppercase tracking-wide"
            >
              Configure Leash ↗
            </button>
            <span className="text-[#D8CFBC]">•</span>
            <span className="text-[#777]">Function-Call Keys Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
