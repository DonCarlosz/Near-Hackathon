import React, { useState, useEffect } from 'react';
import { useVoiceLeash } from '../context/VoiceLeashContext';
import DotMatrixMic from './DotMatrixMic';

export default function LeashControl() {
  const {
    policy,
    updateRulesWithText,
    pendingRequest,
    approvePending,
    denyPending,
    allocateDailyFunds,
    wallet
  } = useVoiceLeash();

  const [inputRule, setInputRule] = useState(policy.rawRuleText);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setInputRule(policy.rawRuleText);
  }, [policy.rawRuleText]);

  // Voice recognition toggle
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type rules below.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputRule(transcript);
        updateRulesWithText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (inputRule.trim()) {
      updateRulesWithText(inputRule.trim());
    }
  };

  const presets = [
    {
      label: "[ 01 / CONSERVATIVE 1 Ⓝ ]",
      text: "Spend up to 1 NEAR daily on data, but ask me for anything over 0.25."
    },
    {
      label: "[ 02 / MICRO-LEASH 0.5 Ⓝ ]",
      text: "Max 0.5 NEAR daily limit, and ask me for anything exceeding 0.15 NEAR."
    },
    {
      label: "[ 03 / BALANCED 1.5 Ⓝ ]",
      text: "Spend up to 1.5 NEAR daily on research, but confirm anything over 0.4 NEAR."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Category header */}
      <div className="font-mono text-[11px] font-bold text-[#0047FF] tracking-[0.08em] uppercase mb-2">
        02 / CONTROL & LEASH ENFORCEMENT
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D8CFBC] pb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
            SET SPENDING RULES.<br />
            <span className="text-[#0047FF]">ZERO RUNAWAY RISK.</span>
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#555] mt-2 max-w-2xl leading-relaxed">
            Speak or type plain instructions. The VoiceLeash policy contract bounds your agent to limited Function-Call keys.
          </p>
        </div>
      </div>

      {/* Intercepted Proposal Box (Grid Style) */}
      {pendingRequest && (
        <div className="border border-amber-600 bg-[#EFE9DC] p-6 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-amber-800 font-bold uppercase tracking-wider">
              [ ⚠️ INTERCEPTED — HUMAN APPROVAL REQUIRED ]
            </span>
            <span className="text-[#777]">{pendingRequest.timestamp}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <div className="text-2xl font-bold text-[#111111]">
                {pendingRequest.product.name} — <span className="text-[#0047FF]">{pendingRequest.product.price} NEAR</span>
              </div>
              <p className="font-mono text-xs text-[#555] leading-relaxed">
                {pendingRequest.reason} The agent is holding its Function-Call key until you tap approve or deny.
              </p>
            </div>

            <div className="md:col-span-4 flex items-center gap-3 justify-start md:justify-end">
              <button
                onClick={denyPending}
                className="px-4 py-2 border border-[#C8BEAA] font-mono text-xs font-bold text-red-600 hover:bg-[#E5DFC8] uppercase transition-colors"
              >
                Deny Request ✕
              </button>
              <button
                onClick={approvePending}
                className="px-5 py-2 bg-[#111111] hover:bg-[#0047FF] text-white font-mono text-xs font-bold uppercase transition-colors"
              >
                Approve (1-Tap) ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-l border-[#D8CFBC]">
        
        {/* Left Column: Natural Language Input */}
        <div className="lg:col-span-7 border-r border-b border-[#D8CFBC] bg-[#EFE9DC] p-6 sm:p-8 space-y-6">
          <div className="font-mono text-[11px] text-[#777] uppercase">
            [ PLAIN-LANGUAGE INPUT ENGINE ]
          </div>

          {/* Voice Button with NEAR Dot-Matrix Microphone */}
          <div className="border border-[#D8CFBC] p-4 flex items-center gap-4 bg-[#EAE3D4]/50">
            <button
              onClick={toggleListening}
              className={`p-2.5 border border-[#D8CFBC] transition-all flex items-center justify-center ${
                isListening
                  ? 'bg-red-50 border-red-400'
                  : 'bg-[#EFE9DC] hover:border-[#0047FF]'
              }`}
              title={isListening ? "Listening... click to stop" : "Click to speak rules"}
            >
              <DotMatrixMic isListening={isListening} />
            </button>
            <div className="font-mono text-xs">
              <div className="font-bold text-[#111111] uppercase">
                {isListening ? "Listening to your voice..." : "Voice Recognition Engine"}
              </div>
              <p className="text-[#666] text-[11px] mt-0.5">
                {isListening
                  ? "Speak rules now (e.g. 'Spend up to 2 NEAR daily, ask above 0.4')"
                  : "Tap dot-matrix mic to dictate policy boundaries"}
              </p>
            </div>
          </div>

          {/* Text Form */}
          <form onSubmit={handleApply} className="space-y-4">
            <label className="block font-mono text-xs font-bold uppercase text-[#333]">
              Type spending policy:
            </label>
            <textarea
              rows={3}
              value={inputRule}
              onChange={(e) => setInputRule(e.target.value)}
              placeholder="e.g. You can spend up to 2 NEAR a day on data, but ask me for anything over 0.4."
              className="w-full p-3 font-mono text-xs border border-[#D8CFBC] bg-[#FAF7F0] focus:outline-none focus:border-[#0047FF] resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#777]">
                Parses automatically into NEAR smart contract policy
              </span>
              <button
                type="submit"
                className="bg-[#111111] hover:bg-[#0047FF] text-white px-5 py-2 font-mono text-xs font-bold uppercase transition-colors"
              >
                Apply Rules ↗
              </button>
            </div>
          </form>

          {/* Presets */}
          <div className="pt-4 border-t border-[#D8CFBC] space-y-2">
            <div className="font-mono text-[11px] text-[#888] uppercase">Quick Presets:</div>
            <div className="space-y-2">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    setInputRule(p.text);
                    updateRulesWithText(p.text);
                  }}
                  className="w-full text-left p-2.5 border border-[#D8CFBC] hover:border-[#0047FF] hover:bg-[#EAE3D4] transition-colors font-mono text-xs"
                >
                  <span className="font-bold text-[#0047FF] block text-[10px] mb-0.5">{p.label}</span>
                  <span className="text-[#444] text-[11px]">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Policy Status */}
        <div className="lg:col-span-5 border-r border-b border-[#D8CFBC] bg-[#EFE9DC] p-6 sm:p-8 space-y-6">
          <div className="font-mono text-[11px] text-[#777] uppercase">
            [ ON-CHAIN POLICY STATE ]
          </div>

          {/* Daily Limit Metric */}
          <div className="border border-[#D8CFBC] p-4 bg-[#EAE3D4]/40 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#888] uppercase text-[10px]">DAILY BUDGET ENFORCED</span>
              <button
                onClick={() => allocateDailyFunds(1.0)}
                className="text-[10px] text-[#0047FF] hover:underline font-bold uppercase"
                title="Deposit 1.0 NEAR daily allocation on-chain"
              >
                Deposit 1.0 Ⓝ On-Chain ↗
              </button>
            </div>
            <div className="text-3xl font-extrabold text-[#111111]">
              {policy.spentToday} / {policy.dailyLimit} <span className="text-lg text-[#0047FF]">NEAR</span>
            </div>
            <div className="w-full bg-[#D8CFBC] h-1.5 mt-2">
              <div
                className="bg-[#0047FF] h-full"
                style={{ width: `${Math.min(100, (policy.spentToday / policy.dailyLimit) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-[#777] pt-1 flex items-center justify-between">
              <span>Remaining: {(policy.dailyLimit - policy.spentToday).toFixed(2)} NEAR</span>
              <span className="text-[#555]">Capped at 1.0 Ⓝ</span>
            </div>
          </div>

          {/* Approval Cap Metric */}
          <div className="border border-[#D8CFBC] p-4 bg-[#EAE3D4]/40 space-y-1 font-mono text-xs">
            <div className="text-[#888] uppercase text-[10px]">HUMAN APPROVAL THRESHOLD</div>
            <div className="text-3xl font-extrabold text-[#0047FF]">
              {policy.requireApprovalAbove} <span className="text-lg text-[#111111]">NEAR</span>
            </div>
            <p className="text-[11px] text-[#555] pt-1">
              Any item above this threshold prompts a 1-tap confirmation card.
            </p>
          </div>

          {/* Active Contract Info */}
          <div className="border border-[#D8CFBC] p-4 space-y-2 font-mono text-xs">
            <div className="text-[#888] uppercase text-[10px]">NEAR CRYPTOGRAPHIC GUARANTEE</div>
            <div className="space-y-1 text-[11px] text-[#444]">
              <div>Target Contract: <span className="font-bold text-[#111111]">{policy.contractId}</span></div>
              <div>Key Permission: <span className="font-bold text-[#0047FF]">FunctionCall</span></div>
              <div>Allowed Method: <span className="font-bold text-[#111111]">propose_purchase()</span></div>
              <div>Transfer Fund Rights: <span className="font-bold text-red-600">ZERO (BLOCKED)</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
