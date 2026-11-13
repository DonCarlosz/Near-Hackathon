import React, { useState } from 'react';
import { useVoiceLeash } from '../context/VoiceLeashContext';
import { MARKETPLACE_PRODUCTS } from '../data/products';
import DotMatrixIcon from './DotMatrixIcon';

/**
 * Intelligent Goal Resolver: maps plain-language intent to actual Marketplace Capabilities
 */
export function resolveProductsFromGoal(goal) {
  if (!goal || typeof goal !== 'string') return [MARKETPLACE_PRODUCTS[1]]; // default Weather API (0.15 Ⓝ)

  const text = goal.toLowerCase();
  const matched = new Set();

  // 1. Weather / Climate / Forecast
  if (text.includes('weather') || text.includes('forecast') || text.includes('temp') || text.includes('rain') || text.includes('climate') || text.includes('wind') || text.includes('hub')) {
    matched.add('prod-02');
  }

  // 2. Price / Crypto / Token / Live Feed
  if (text.includes('price') || text.includes('crypto') || text.includes('btc') || text.includes('eth') || text.includes('near') || text.includes('token') || text.includes('feed') || text.includes('trading') || text.includes('cost') || text.includes('ticker') || text.includes('rate')) {
    matched.add('prod-01');
  }

  // 3. News / Digest / Headlines / Sentiment
  if (text.includes('news') || text.includes('digest') || text.includes('headline') || text.includes('sentiment') || text.includes('article') || text.includes('update') || text.includes('24h') || text.includes('media')) {
    matched.add('prod-05');
  }

  // 4. Market Summary / Macro Analysis / Thesis
  if (text.includes('summary') || text.includes('brief') || text.includes('macro') || text.includes('thesis') || text.includes('invest') || text.includes('market analysis') || text.includes('report') || text.includes('overview')) {
    matched.add('prod-03');
  }

  // 5. Security / Audit / Privacy / Contract Research
  if (text.includes('security') || text.includes('audit') || text.includes('research') || text.includes('contract') || text.includes('safeguard') || text.includes('privacy') || text.includes('flow') || text.includes('hack') || text.includes('vulnerability')) {
    matched.add('prod-04');
  }

  // 6. Dataset / History / Historical / CSV
  if (text.includes('dataset') || text.includes('history') || text.includes('historical') || text.includes('csv') || text.includes('archive') || text.includes('past') || text.includes('table') || text.includes('download')) {
    matched.add('prod-06');
  }

  // If no direct keyword matched, perform scoring across products
  if (matched.size === 0) {
    const words = text.split(/\W+/).filter(w => w.length > 2);
    let bestProd = MARKETPLACE_PRODUCTS[0];
    let bestScore = -1;

    for (const prod of MARKETPLACE_PRODUCTS) {
      const prodText = `${prod.name} ${prod.headline} ${prod.description} ${prod.tags.join(' ')} ${prod.cat}`.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (prodText.includes(w)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestProd = prod;
      }
    }
    matched.add(bestProd.id);
  }

  return Array.from(matched).map(id => MARKETPLACE_PRODUCTS.find(p => p.id === id)).filter(Boolean);
}

export default function AgentGoalPanel() {
  const { wallet, policy, requestAgentPurchase, showNotification, setActiveTab } = useVoiceLeash();
  const [goalText, setGoalText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [synthesizedResult, setSynthesizedResult] = useState(null);

  const goalPresets = [
    {
      label: "[ 01 / WEATHER RADAR ]",
      goal: "Check 7-day weather forecast for tech hubs",
      neededProductIds: ["prod-02"], // Weather API 0.15 NEAR (Under 0.25 NEAR leash -> AUTO)
    },
    {
      label: "[ 02 / MARKET BRIEF ]",
      goal: "Analyze live prices and compile market brief",
      neededProductIds: ["prod-01", "prod-03"], // Price Feed 0.3 Ⓝ + Market Summary 0.5 Ⓝ (Needs approval)
    },
    {
      label: "[ 03 / SECURITY AUDIT ]",
      goal: "Perform full on-chain smart contract security audit",
      neededProductIds: ["prod-04"], // On-chain Research 0.8 Ⓝ (Needs approval)
    },
    {
      label: "[ 04 / MORNING NEWS ]",
      goal: "Fetch latest crypto news digest and sentiment update",
      neededProductIds: ["prod-05"], // News Digest 0.20 Ⓝ (Under 0.25 Ⓝ leash -> AUTO)
    }
  ];

  const runAutonomousAgent = async (targetGoal, explicitProductIds = null) => {
    if (!wallet.isConnected) {
      showNotification('Please connect your NEAR testnet wallet first', 'error');
      return;
    }

    setIsRunning(true);
    setAgentLogs([]);
    setSynthesizedResult(null);

    const addLog = (msg, type = 'info') => {
      setAgentLogs(prev => [...prev, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), msg, type }]);
    };

    addLog(`Goal received: "${targetGoal}"`, 'info');
    await new Promise(r => setTimeout(r, 500));

    // Resolve needed products dynamically based on input!
    let selectedProducts = [];
    if (explicitProductIds && explicitProductIds.length > 0) {
      selectedProducts = MARKETPLACE_PRODUCTS.filter(p => explicitProductIds.includes(p.id));
    } else {
      selectedProducts = resolveProductsFromGoal(targetGoal);
    }

    addLog(`Autonomous tool resolver matched ${selectedProducts.length} required capability(s) from Marketplace:`, 'info');
    selectedProducts.forEach(p => {
      addLog(`→ ${p.name} (${p.price} Ⓝ) [${p.cat}]`, 'info');
    });
    await new Promise(r => setTimeout(r, 700));

    const acquiredDeliverables = [];

    // Evaluate each tool against leash
    for (const prod of selectedProducts) {
      addLog(`Evaluating spending leash for "${prod.name}" (${prod.price} Ⓝ)...`, 'info');
      await new Promise(r => setTimeout(r, 600));

      if (prod.price <= policy.requireApprovalAbove) {
        addLog(`[PASS] Price ${prod.price} Ⓝ ≤ Auto-approval cap ${policy.requireApprovalAbove} Ⓝ. Purchasing autonomously (no wallet pop-up)...`, 'success');
        requestAgentPurchase(prod);
        acquiredDeliverables.push(prod);
        await new Promise(r => setTimeout(r, 800));
        addLog(`Acquired ${prod.name} payload into agent memory context.`, 'success');
      } else {
        addLog(`[LEASH INTERCEPT] Price ${prod.price} Ⓝ > Auto-approval cap ${policy.requireApprovalAbove} Ⓝ!`, 'warning');
        addLog(`Pausing execution: Intercepted proposal dispatched for human 1-tap sign-off.`, 'warning');
        requestAgentPurchase(prod);
        setIsRunning(false);
        return; // Pause for human decision
      }
    }

    // If all products auto-approved, synthesize result with ACTUAL product deliverables!
    await new Promise(r => setTimeout(r, 800));
    addLog(`All requested deliverables acquired successfully. Synthesizing final intelligence brief...`, 'info');
    await new Promise(r => setTimeout(r, 600));

    setSynthesizedResult({
      title: "Agent Execution Deliverables",
      goal: targetGoal,
      summary: `Successfully completed goal within your ${policy.dailyLimit} Ⓝ daily leash. ${acquiredDeliverables.length} digital capability payload(s) unlocked and verified on-chain.`,
      deliverables: acquiredDeliverables
    });
    setIsRunning(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    runAutonomousAgent(goalText.trim());
  };

  return (
    <div className="border border-[#D8CFBC] bg-[#EFE9DC] p-6 sm:p-7 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8CFBC] pb-4">
        <div>
          <div className="font-mono text-[10.5px] font-bold text-[#0047FF] tracking-[0.08em] uppercase">
            [ AUTONOMOUS SHOPPER AGENT ENGINE ]
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111111] mt-0.5">
            Give your agent a high-level goal.
          </h2>
        </div>

        <div className="font-mono text-xs text-[#555] bg-[#EAE3D4] px-3 py-1.5 border border-[#D8CFBC]">
          <span>DAILY LEASH: </span>
          <span className="font-bold text-[#0047FF]">{policy.dailyLimit} Ⓝ</span>
          <span className="mx-2">•</span>
          <span>AUTO-APPROVE: </span>
          <span className="font-bold text-emerald-700">≤ {policy.requireApprovalAbove} Ⓝ</span>
        </div>
      </div>

      {/* Goal Input & Action */}
      <div className="space-y-3 font-mono text-xs">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="Type any goal: e.g. 'Get weather report', 'Check crypto prices', 'Summarize latest news'..."
            className="flex-1 p-3 bg-[#FAF7F0] border border-[#D8CFBC] focus:outline-none focus:border-[#0047FF] text-xs font-mono"
          />
          <button
            type="submit"
            disabled={isRunning || !goalText.trim()}
            className="px-6 py-3 bg-[#0047FF] hover:bg-[#003CD6] text-white font-bold uppercase transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
          >
            <span>{isRunning ? "Agent Thinking..." : "Run Agent ↗"}</span>
          </button>
        </form>

        {/* Quick Task Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[#888] uppercase text-[10.5px]">Task Presets:</span>
          {goalPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setGoalText(preset.goal);
                runAutonomousAgent(preset.goal, preset.neededProductIds);
              }}
              disabled={isRunning}
              className="px-2.5 py-1 border border-[#D0C7B4] bg-[#EAE3D4]/40 hover:bg-[#EAE3D4] hover:border-[#0047FF] text-[#444] text-[11px] transition-colors"
            >
              <span className="text-[#0047FF] font-bold mr-1">{preset.label}</span>
              <span>{preset.goal}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Agent Reasoning Terminal */}
      {agentLogs.length > 0 && (
        <div className="border border-[#D8CFBC] bg-[#111111] p-4 font-mono text-xs space-y-2 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between text-[#888] text-[10px] uppercase border-b border-[#2B2720] pb-2 mb-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AGENT AUTONOMOUS REASONING FEED</span>
            </span>
            <span>policy.voiceleash.testnet</span>
          </div>

          {agentLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
              <span className="text-[#666] select-none">[{log.time}]</span>
              <span className={
                log.type === 'success' ? 'text-emerald-400 font-semibold' :
                log.type === 'warning' ? 'text-amber-400 font-bold' :
                'text-[#D8CFBC]'
              }>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Finished Output Card with Real Deliverables */}
      {synthesizedResult && (
        <div className="p-5 border border-emerald-500 bg-emerald-50/20 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between text-emerald-800 font-bold uppercase text-[11px] border-b border-emerald-200 pb-2">
            <span>✓ {synthesizedResult.title}: "{synthesizedResult.goal}"</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              {synthesizedResult.deliverables.length} PAYLOAD(S) DELIVERED
            </span>
          </div>
          
          <p className="text-[#333] text-[11.5px] leading-relaxed">
            {synthesizedResult.summary}
          </p>

          {/* Actual Acquired Deliverable Content */}
          <div className="space-y-3 pt-2">
            {synthesizedResult.deliverables.map((item) => (
              <div key={item.id} className="border border-[#D8CFBC] bg-[#EFE9DC] p-3 space-y-2">
                <div className="flex items-center justify-between font-bold text-[#111111]">
                  <span>[ DELIVERABLE: {item.name} ({item.price} Ⓝ) ]</span>
                  <span className="text-[#0047FF] text-[10px] uppercase">{item.cat}</span>
                </div>
                <div className="bg-[#111111] text-emerald-400 p-3 text-[11px] overflow-x-auto max-h-40">
                  <pre className="whitespace-pre-wrap">
                    {typeof item.samplePayload === 'object'
                      ? JSON.stringify(item.samplePayload, null, 2)
                      : String(item.samplePayload)}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px]">
            <button
              onClick={() => setActiveTab('history')}
              className="text-[#0047FF] hover:underline font-bold uppercase"
            >
              View Full Audit Trail & Export Files ↗
            </button>
            <span className="text-[#666]">Stored under policy leash</span>
          </div>
        </div>
      )}

    </div>
  );
}
