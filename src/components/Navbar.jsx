import React from 'react';
import { useVoiceLeash } from '../context/VoiceLeashContext';
import NearDotLogo from './NearDotLogo';

export default function Navbar() {
  const { wallet, openWalletModal, disconnectWallet, activeTab, setActiveTab, pendingRequest } = useVoiceLeash();

  return (
    <header className="sticky top-0 z-40 bg-[#EFE9DC] border-b border-[#D8CFBC]">
      <div className="max-w-[1380px] mx-auto px-6 sm:px-10 md:px-14 h-20 flex items-center justify-between">
        
        {/* Left: Signature Dot-Matrix Logo + Brand */}
        <div 
          onClick={() => setActiveTab('market')}
          className="cursor-pointer flex items-center gap-3 group"
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

        {/* Center: Clean Monospace Nav Links (Matches: Tracks Timeline Projects Judges Ecosystem Toolkit) */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs">
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

        {/* Right: Connect Wallet Button (Moon icon removed) */}
        <div className="flex items-center">
          {wallet.isConnected ? (
            <div className="flex items-center gap-2.5 border border-[#D8CFBC] bg-[#EFE9DC] px-3.5 py-2 font-mono text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <button 
                onClick={openWalletModal}
                className="font-bold text-[#111111] hover:text-[#0047FF] transition-colors"
                title="View wallet or switch account"
              >
                {wallet.accountId}
              </button>
              <span className="text-[#0047FF] font-bold">({wallet.balance} Ⓝ)</span>
              <button 
                onClick={disconnectWallet}
                className="ml-2 text-[10px] text-red-600 hover:underline uppercase font-bold"
              >
                Disconnect
              </button>
            </div>
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
