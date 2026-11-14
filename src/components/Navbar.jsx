import React, { useState, useRef, useEffect } from 'react';
import { useVoiceLeash } from '../context/VoiceLeashContext';
import { VOICELEASH_VAULT_ACCOUNT } from '../services/nearWallet';
import NearDotLogo from './NearDotLogo';

export default function Navbar() {
  const { 
    wallet, 
    openWalletModal, 
    disconnectWallet, 
    activeTab, 
    setActiveTab, 
    pendingRequest,
    agentBalance,
    allocatedBudget,
    policy,
    reclaimSpentFunds,
    allocateDailyFunds
  } = useVoiceLeash();

  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAgentMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#EFE9DC] border-b border-[#D8CFBC]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 md:px-14 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Signature Dot-Matrix Logo + Brand */}
        <div 
          onClick={() => setActiveTab('market')}
          className="cursor-pointer flex items-center gap-3 group shrink-0"
        >
          {/* Authentic NEAR 10x10 Dot-Matrix Logo */}
          <div className="flex items-center">
            <NearDotLogo />
          </div>

          {/* Typography matching: near | HCKTHN */}
          <div className="flex items-center gap-2.5">
            <span className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-[#111111] group-hover:text-[#0047FF] transition-colors lowercase">
              voiceleash
            </span>
            <span className="text-[#BDB4A0] font-light text-base">|</span>
            <span className="font-mono text-xs font-semibold tracking-wider text-[#666] uppercase">
              HCKTHN
            </span>
          </div>
        </div>

        {/* Center: Clean Monospace Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 font-mono text-xs">
          <button
            onClick={() => setActiveTab('market')}
            className={`transition-colors py-1 ${
              activeTab === 'market'
                ? 'text-[#0047FF] font-bold border-b-2 border-[#0047FF]'
                : 'text-[#444] hover:text-[#0047FF]'
            }`}
          >
            Shop
          </button>

          <button
            onClick={() => setActiveTab('control')}
            className={`relative transition-colors py-1 ${
              activeTab === 'control'
                ? 'text-[#0047FF] font-bold border-b-2 border-[#0047FF]'
                : 'text-[#444] hover:text-[#0047FF]'
            }`}
          >
            <span>Leash Rules</span>
            {pendingRequest && (
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            )}
            {pendingRequest && (
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`transition-colors py-1 ${
              activeTab === 'history'
                ? 'text-[#0047FF] font-bold border-b-2 border-[#0047FF]'
                : 'text-[#444] hover:text-[#0047FF]'
            }`}
          >
            Audit Logs
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`transition-colors py-1 ${
              activeTab === 'security'
                ? 'text-[#0047FF] font-bold border-b-2 border-[#0047FF]'
                : 'text-[#444] hover:text-[#0047FF]'
            }`}
          >
            Key Security
          </button>
        </nav>

        {/* Right: User Wallet + Agent Balance Pill with Reclaim Option */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {wallet.isConnected ? (
            <>
              {/* 1. User Personal Wallet Pill */}
              <div className="flex items-center gap-2 border border-[#D8CFBC] bg-[#EAE3D4]/50 px-3 py-1.5 font-mono text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <button 
                  onClick={openWalletModal}
                  className="font-bold text-[#111111] hover:text-[#0047FF] transition-colors"
                  title="View wallet details"
                >
                  <span className="hidden sm:inline">{wallet.accountId}</span>
                  <span className="sm:hidden">{wallet.accountId.split('.')[0]}</span>
                </button>
                <span className="text-[#111111] font-extrabold">({wallet.balance} Ⓝ)</span>
                <button 
                  onClick={disconnectWallet}
                  className="ml-1 text-[10px] text-red-600 hover:underline uppercase font-bold"
                  title="Disconnect wallet"
                >
                  ✕
                </button>
              </div>

              {/* 2. Agent Escrow Holding Pill (Clickable Dropdown to Claim Funds Back) */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2 border px-3 py-1.5 font-mono text-xs transition-all shadow-2xs cursor-pointer ${
                    isAgentMenuOpen
                      ? 'border-[#0047FF] bg-[#0047FF] text-white'
                      : 'border-[#0047FF] bg-[#EFE9DC] text-[#111111] hover:bg-[#EAE3D4]'
                  }`}
                  title="Click to view agent funds or claim back to wallet"
                >
                  <span className={`w-2 h-2 rounded-full ${isAgentMenuOpen ? 'bg-white' : 'bg-[#0047FF] animate-pulse'}`} />
                  <span className="font-bold uppercase tracking-wider text-[10.5px]">Agent:</span>
                  <span className={`font-extrabold ${isAgentMenuOpen ? 'text-white' : 'text-[#0047FF]'}`}>
                    {agentBalance} Ⓝ
                  </span>
                  <span className="text-[10px] ml-0.5 opacity-80">
                    {isAgentMenuOpen ? '▲' : '▼'}
                  </span>
                </button>

                {/* Dropdown Card */}
                {isAgentMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 border border-[#D8CFBC] bg-[#EFE9DC] shadow-xl p-5 z-50 font-mono text-xs space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-[#D8CFBC] pb-3">
                      <div>
                        <div className="text-[10px] text-[#0047FF] font-bold tracking-wider uppercase">
                          [ AGENT ESCROW HOLDINGS ]
                        </div>
                        <div className="text-sm font-extrabold text-[#111111] mt-0.5">
                          Autonomous Shopper Vault
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                        Active Escrow
                      </span>
                    </div>

                    {/* Balance Highlight */}
                    <div className="bg-[#EAE3D4]/60 border border-[#D8CFBC] p-3 space-y-1.5">
                      <div className="text-[10px] text-[#777] uppercase">Current Unspent Agent Balance:</div>
                      <div className="text-3xl font-extrabold text-[#0047FF] flex items-baseline gap-1.5">
                        <span>{agentBalance}</span>
                        <span className="text-base text-[#111111]">NEAR</span>
                      </div>
                      <div className="text-[10.5px] text-[#555] flex justify-between pt-1 border-t border-[#D8CFBC]/60">
                        <span>Total Allocated: {allocatedBudget} Ⓝ</span>
                        <span>Spent Today: {policy.spentToday} Ⓝ</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#555] leading-relaxed">
                      These funds are securely held in your agent's escrow vault (<code className="text-[#111111] font-bold text-[10px]">{VOICELEASH_VAULT_ACCOUNT.slice(0, 18)}...</code>) for autonomous micro-purchases. If unspent, you have full control to claim them back to your wallet at any time.
                    </p>

                    {/* Action Button: Claim Back to Wallet */}
                    <div className="space-y-2 pt-1">
                      {agentBalance > 0 ? (
                        <button
                          onClick={async () => {
                            setIsClaiming(true);
                            await reclaimSpentFunds(agentBalance);
                            setIsClaiming(false);
                            setIsAgentMenuOpen(false);
                          }}
                          disabled={isClaiming}
                          className="w-full py-2.5 bg-[#111111] hover:bg-[#0047FF] text-white font-bold uppercase transition-colors text-xs flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                          {isClaiming ? (
                            <span>Refunding On-Chain...</span>
                          ) : (
                            <>
                              <span>Claim Back to Wallet ({agentBalance} Ⓝ)</span>
                              <span>↺</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await allocateDailyFunds(1.0);
                            setIsAgentMenuOpen(false);
                          }}
                          className="w-full py-2.5 bg-[#0047FF] hover:bg-[#003CD6] text-white font-bold uppercase transition-colors text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                        >
                          <span>Deposit 1.0 Ⓝ to Agent Vault</span>
                          <span>↗</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={openWalletModal}
              className="bg-[#0047FF] hover:bg-[#003CD6] text-white px-5 py-2.5 font-mono text-xs font-bold uppercase transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>Connect Wallet</span>
              <span>↗</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
