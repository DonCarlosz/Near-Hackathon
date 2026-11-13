import React from 'react';

export default function SecurityExplainer() {
  return (
    <div className="space-y-8">
      {/* Category header */}
      <div className="font-mono text-xs font-bold text-[#0047FF] tracking-wider uppercase">
        04 / MATHEMATICAL SECURITY & LEAST-PRIVILEGE KEYS
      </div>

      <div className="border-b border-[#D8CFBC] pb-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
          NEAR FUNCTION-CALL KEYS.<br />
          <span className="text-[#0047FF]">ZERO TRUST DELEGATION.</span>
        </h1>
        <p className="font-mono text-xs sm:text-sm text-[#555] mt-2 max-w-2xl leading-relaxed">
          Most bot tools ask users to paste private keys. VoiceLeash uses NEAR Protocol’s native permission model to make fund theft mathematically impossible.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[#D8CFBC]">
        
        {/* Full Access */}
        <div className="border-r border-b border-[#D8CFBC] bg-[#EFE9DC] p-6 sm:p-8 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-red-600 font-bold">
            <span>[ ✕ TRADITIONAL BOTS ]</span>
            <span>HIGH RISK</span>
          </div>
          <h3 className="text-xl font-bold font-sans text-[#111111]">Full Access Key Handover</h3>
          <p className="text-[#555] leading-relaxed">
            The bot holds a master private key. Prompt injection or malicious jailbreak grants full control of the wallet.
          </p>
          <ul className="space-y-2 text-red-700 pt-2 text-[11px]">
            <li>✕ Can transfer 100% of NEAR tokens to any address</li>
            <li>✕ Can delete the NEAR account or remove owner keys</li>
            <li>✕ Can call arbitrary unverified smart contracts</li>
          </ul>
        </div>

        {/* Function-Call Key */}
        <div className="border-r border-b border-[#D8CFBC] bg-[#EAE3D4]/50 p-6 sm:p-8 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[#0047FF] font-bold">
            <span>[ ✓ VOICELEASH MODEL ]</span>
            <span>MATHEMATICALLY SECURE</span>
          </div>
          <h3 className="text-xl font-bold font-sans text-[#111111]">Scoped Function-Call Key</h3>
          <p className="text-[#555] leading-relaxed">
            The agent is provisioned only with an access key mathematically restricted to the VoiceLeash Policy Contract.
          </p>
          <ul className="space-y-2 text-[#0047FF] pt-2 text-[11px]">
            <li>✓ Receiver strictly bound to policy.voiceleash.testnet</li>
            <li>✓ Method strictly limited to propose_purchase()</li>
            <li>✓ Direct fund transfers physically rejected by NEAR runtime</li>
          </ul>
        </div>

      </div>

      {/* Architecture Pipeline */}
      <div className="border-t border-l border-[#D8CFBC] grid grid-cols-1 sm:grid-cols-4 font-mono text-xs">
        <div className="border-r border-b border-[#D8CFBC] bg-[#EFE9DC] p-5 space-y-2">
          <div className="text-[#888] text-[10px]">[ 01 / HUMAN ]</div>
          <div className="font-bold text-[#111111] uppercase">Speaks Limits</div>
          <p className="text-[#666] text-[11px] leading-relaxed">
            Sets daily budget & auto-approval threshold in plain words.
          </p>
        </div>

        <div className="border-r border-b border-[#D8CFBC] bg-[#EFE9DC] p-5 space-y-2">
          <div className="text-[#888] text-[10px]">[ 02 / PROTOCOL ]</div>
          <div className="font-bold text-[#111111] uppercase">Key Delegated</div>
          <p className="text-[#666] text-[11px] leading-relaxed">
            Agent receives limited Function-Call key with zero transfer rights.
          </p>
        </div>

        <div className="border-r border-b border-[#D8CFBC] bg-[#EFE9DC] p-5 space-y-2">
          <div className="text-[#888] text-[10px]">[ 03 / SHOPPING ]</div>
          <div className="font-bold text-[#111111] uppercase">Agent Proposes</div>
          <p className="text-[#666] text-[11px] leading-relaxed">
            Smart contract checks price against auto-approval cap.
          </p>
        </div>

        <div className="border-r border-b border-[#D8CFBC] bg-[#EFE9DC] p-5 space-y-2">
          <div className="text-[#888] text-[10px]">[ 04 / VERDICT ]</div>
          <div className="font-bold text-[#111111] uppercase">1-Tap Decision</div>
          <p className="text-[#666] text-[11px] leading-relaxed">
            Auto-buys if under threshold, halts for 1-tap sign-off if above.
          </p>
        </div>
      </div>

    </div>
  );
}
