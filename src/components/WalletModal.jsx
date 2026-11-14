import React, { useState } from 'react';
import { useVoiceLeash } from '../context/VoiceLeashContext';
import { signInWithMeteor } from '../services/nearWallet';
import NearDotLogo from './NearDotLogo';

export default function WalletModal({ isOpen, onClose }) {
  const { connectAccount, showNotification } = useVoiceLeash();
  const [customAccountId, setCustomAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleMeteorConnect = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      showNotification('Opening Meteor Wallet pop-up... Please approve connection.', 'info');
      const accounts = await signInWithMeteor();
      
      if (accounts && accounts.length > 0) {
        const primaryAccount = accounts[0].accountId;
        await connectAccount(primaryAccount);
        showNotification(`Authorized via Meteor Wallet: ${primaryAccount}`, 'success');
        onClose();
      } else {
        // Fallback or cancelled
        setLoading(false);
      }
    } catch (err) {
      console.error('Meteor sign in error:', err);
      setErrorMsg(err.message || 'Meteor authorization was closed or declined.');
      setLoading(false);
    }
  };

  const handleVerifyAndConnect = async (e) => {
    e.preventDefault();
    if (!customAccountId.trim()) return;

    setLoading(true);
    setErrorMsg('');

    const success = await connectAccount(customAccountId.trim());
    setLoading(false);
    if (success) {
      onClose();
    } else {
      setErrorMsg(`Could not find "${customAccountId.trim()}" on NEAR Testnet. Please ensure you switched Meteor to Testnet and have funded it at near-faucet.io.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#EFE9DC] border border-[#D8CFBC] w-full max-w-lg shadow-2xl font-mono text-xs">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D8CFBC]">
          <div className="flex items-center gap-2.5">
            <NearDotLogo />
            <span className="font-bold text-sm text-[#111111] uppercase tracking-wider">
              CONNECT NEAR TESTNET WALLET
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#777] hover:text-[#111111] font-bold text-sm px-1.5 py-0.5"
          >
            [ ✕ ]
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Method 1: Meteor Wallet Pop-up Authorization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#777] uppercase font-bold">
              <span>[ 01 / METEOR WALLET — OFFICIAL SIGNING ]</span>
              <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">EXTENSION READY</span>
            </div>
            
            <button
              onClick={handleMeteorConnect}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#0047FF] hover:bg-[#003CD6] text-white font-bold uppercase flex items-center justify-between transition-colors shadow-2xs text-xs"
            >
              <span>{loading ? "Waiting for Meteor Approval..." : "Sign in with Meteor Wallet ↗"}</span>
              <span>↗</span>
            </button>
            <p className="text-[10.5px] text-[#666] leading-relaxed">
              Triggers the Meteor Wallet extension to pop up and cryptographically authorize your <code>.testnet</code> account.
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#D8CFBC] w-full" />
            <span className="bg-[#EFE9DC] px-3 text-[10px] text-[#888] uppercase absolute">OR</span>
          </div>

          {/* Method 2: Direct Testnet Account Connect */}
          <div className="space-y-2.5">
            <div className="text-[10px] text-[#777] uppercase font-bold">[ 02 / CONNECT BY TESTNET ID ]</div>
            <p className="text-[10.5px] text-[#666]">
              Enter your testnet account (e.g. <code>username.testnet</code>). We query the official Testnet RPC and Fastnear RPC directly.
            </p>
            <form onSubmit={handleVerifyAndConnect} className="space-y-2.5">
              <input
                type="text"
                value={customAccountId}
                onChange={(e) => setCustomAccountId(e.target.value)}
                placeholder="e.g. username.testnet"
                className="w-full p-2.5 bg-[#FAF7F0] border border-[#D8CFBC] text-xs font-mono focus:outline-none focus:border-[#0047FF]"
              />

              {errorMsg && (
                <div className="p-2.5 border border-red-300 bg-red-50 text-red-700 text-[11px] leading-tight">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#111111] hover:bg-[#0047FF] text-white font-bold uppercase transition-colors disabled:opacity-50"
              >
                {loading ? "Querying Testnet RPC..." : "Pull Balance & Connect ↗"}
              </button>
            </form>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#D8CFBC] w-full" />
            <span className="bg-[#EFE9DC] px-3 text-[10px] text-[#888] uppercase absolute">TESTNET FAUCET</span>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-[#EAE3D4]/60 p-3 border border-[#D8CFBC] space-y-1.5 text-[11px] text-[#444]">
            <div className="font-bold text-[#111111] uppercase text-[10px]">[ METEOR TESTNET NOTE ]:</div>
            <div>Make sure your Meteor Wallet is switched to <strong>Testnet</strong> (not Mainnet) so it can sign with your <code>.testnet</code> account.</div>
          </div>

        </div>

      </div>
    </div>
  );
}
