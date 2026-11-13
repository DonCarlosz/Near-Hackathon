import React from 'react';
import { useVoiceLeash } from './context/VoiceLeashContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marketplace from './components/Marketplace';
import LeashControl from './components/LeashControl';
import PurchaseHistory from './components/PurchaseHistory';
import SecurityExplainer from './components/SecurityExplainer';
import WalletModal from './components/WalletModal';

export default function App() {
  const { activeTab, notification, pendingRequest, setActiveTab, isWalletModalOpen, closeWalletModal } = useVoiceLeash();

  return (
    <div className="min-h-screen flex flex-col bg-[#EFE9DC] text-[#111111]">
      {/* 80px Height Blueprint Navigation Bar */}
      <Navbar />

      {/* Main Canvas Container with Spacious Breathing Room Under Navbar */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-6 sm:px-10 md:px-14 pt-10 sm:pt-14 pb-20 space-y-10">
        
        {/* Banner Alert (Grid Monospace Box) */}
        {notification && (
          <div className="p-3.5 border border-[#D8CFBC] bg-[#EAE3D4] font-mono text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0047FF]">[ NOTICE ]:</span>
              <span>{notification.msg}</span>
            </div>
            {notification.type === 'warning' && pendingRequest && (
              <button
                onClick={() => setActiveTab('control')}
                className="font-bold text-[#0047FF] hover:underline uppercase text-[11px]"
              >
                Review Proposal ↗
              </button>
            )}
          </div>
        )}

        {/* Hero Header */}
        {activeTab === 'market' && <Hero />}

        {/* Dynamic Views */}
        {activeTab === 'market' && <Marketplace />}
        {activeTab === 'control' && <LeashControl />}
        {activeTab === 'history' && <PurchaseHistory />}
        {activeTab === 'security' && <SecurityExplainer />}

      </main>

      {/* Real Testnet Wallet Connection Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={closeWalletModal} />

      {/* Editorial Grid Footer */}
      <footer className="border-t border-[#D8CFBC] py-10 mt-16 font-mono text-[11px] text-[#777]">
        <div className="max-w-[1380px] mx-auto px-6 sm:px-10 md:px-14 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111111] uppercase">VOICELEASH</span>
            <span>/</span>
            <span>NEAR HACKATHON 2026</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://nearhackathon.com" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-[#0047FF] underline"
            >
              nearhackathon.com ↗
            </a>
            <span>•</span>
            <span className="text-[#888]">TRACKS: AGENTS / SECURITY / REAL-WORLD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
