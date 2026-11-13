import React, { useState } from 'react';
import { useVoiceLeash } from '../context/VoiceLeashContext';
import { MARKETPLACE_PRODUCTS } from '../data/products';
import DotMatrixIcon from './DotMatrixIcon';
import AgentGoalPanel from './AgentGoalPanel';

export default function Marketplace() {
  const { policy, requestAgentPurchase } = useVoiceLeash();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showAll, setShowAll] = useState(false);

  const filterList = ['ALL', 'DATA', 'API', 'RESEARCH', 'NEWS', 'INTENTS', 'SECURITY', 'AI'];

  const filteredProducts = MARKETPLACE_PRODUCTS.filter(p => {
    if (activeFilter === 'ALL') return true;
    return p.tags.includes(activeFilter);
  });

  // Display 6 items initially when in 'ALL' view, or all if showAll is true
  const displayedProducts = (activeFilter === 'ALL' && !showAll)
    ? filteredProducts.slice(0, 6)
    : filteredProducts;

  return (
    <div className="space-y-10">
      
      {/* Autonomous Goal Planning Panel */}
      <AgentGoalPanel />

      <div className="space-y-6">
        {/* Grid Sub-Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs border-b border-[#D8CFBC] pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[#888] mr-1 uppercase">[ TRACK ]:</span>
            {filterList.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveFilter(cat);
                  setShowAll(true); // show all matches if filter selected
                }}
                className={`px-2.5 py-1 text-[11px] uppercase transition-colors ${
                  activeFilter === cat
                    ? 'bg-[#111111] text-white font-bold'
                    : 'border border-[#D8CFBC] bg-[#EFE9DC] text-[#555] hover:bg-[#E5DFC8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[#555] text-[11px]">
            <div>
              <span className="text-[#888] uppercase">STOCK: </span>
              <span className="font-bold text-[#111111]">12 CAPABILITIES</span>
            </div>
            <div>
              <span className="text-[#888] uppercase">AUTO-APPROVE: </span>
              <span className="font-bold text-[#0047FF]">≤ {policy.requireApprovalAbove} Ⓝ</span>
            </div>
            <div>
              <span className="text-[#888] uppercase">DAILY LEASH: </span>
              <span className="font-bold text-[#111111]">{policy.dailyLimit} Ⓝ</span>
            </div>
          </div>
        </div>

        {/* Connected 3-Column Architectural Grid (Identical to nearhackathon.com) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#D8CFBC]">
          {displayedProducts.map((prod) => {
            const willAutoApprove = prod.price <= policy.requireApprovalAbove;
            const exceedsDaily = (policy.spentToday + prod.price) > policy.dailyLimit;

            return (
              <div
                key={prod.id}
                className="border-r border-b border-[#D8CFBC] bg-[#EFE9DC] hover:bg-[#EAE3D4]/50 p-6 sm:p-7 flex flex-col justify-between transition-colors group relative"
              >
                <div>
                  {/* 1. Monospace Bracket Label (Matches: [ 01 / DFI ]) */}
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#777] mb-6">
                    <span>{prod.trackId}</span>
                    {exceedsDaily ? (
                      <span className="text-red-600 font-bold uppercase tracking-wider text-[10px]">[ EXCEEDS LEASH ]</span>
                    ) : willAutoApprove ? (
                      <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">[ AUTO-APPROVE ]</span>
                    ) : (
                      <span className="text-amber-700 font-bold uppercase tracking-wider text-[10px]">[ ASKS APPROVAL ]</span>
                    )}
                  </div>

                  {/* 2. Signature 10x8 Dot Matrix Graphic */}
                  <div className="mb-7 h-11 flex items-center">
                    <DotMatrixIcon type={prod.iconType} />
                  </div>

                  {/* 3. Blue Monospace Subcategory (Matches: UNSTOPPABLE DEFI) */}
                  <div className="font-mono text-[10.5px] font-bold text-[#0047FF] tracking-[0.08em] uppercase mb-1.5">
                    {prod.cat}
                  </div>

                  {/* 4. Bold Grotesque Headline in Sentence Case (Matches: Markets that never close) */}
                  <h3 className="text-[1.3rem] sm:text-[1.35rem] font-bold text-[#111111] leading-tight mb-3 tracking-[-0.01em]">
                    {prod.headline}
                  </h3>

                  {/* 5. Monospace Typewriter Description with Airy Leading */}
                  <p className="font-mono text-[11.5px] sm:text-[12px] text-[#555] leading-[1.65] mb-6">
                    {prod.description}
                  </p>

                  {/* 6. Rectangular Hairline Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {prod.tags.map(t => (
                      <span
                        key={t}
                        className="border border-[#D0C7B4] text-[9.5px] font-mono px-2 py-0.5 text-[#555] uppercase"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 7. Footer Action Links (Matches: Build in this track ↗   AI prompt ↗) */}
                <div className="pt-4 border-t border-[#D8CFBC] flex items-center justify-between font-mono text-[12px]">
                  <button
                    onClick={() => requestAgentPurchase(prod)}
                    className="font-bold text-[#111111] group-hover:text-[#0047FF] hover:underline flex items-center gap-1 uppercase tracking-wide"
                  >
                    <span>Agent Buy</span>
                    <span>↗</span>
                  </button>

                  <div className="flex items-center gap-2 text-[#777] text-[11.5px]">
                    <span className="font-bold text-[#0047FF]">{prod.price} Ⓝ</span>
                    <span>•</span>
                    <span>In stock</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* See More / Expand Catalog Button */}
        {activeFilter === 'ALL' && (
          <div className="pt-4 flex items-center justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3.5 border border-[#111111] hover:border-[#0047FF] bg-[#EFE9DC] hover:bg-[#111111] text-[#111111] hover:text-white font-mono text-xs font-bold uppercase transition-all shadow-2xs flex items-center gap-2"
            >
              <span>{showAll ? "[ SHOW LESS / COLLAPSE TO 6 ↑ ]" : "[ SEE MORE / EXPAND CATALOG (+6 MORE CAPABILITIES) ↓ ]"}</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
