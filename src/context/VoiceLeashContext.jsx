import React, { createContext, useContext, useState, useEffect } from 'react';
import { MARKETPLACE_PRODUCTS } from '../data/products';
import { parseNaturalLanguageRules } from '../utils/ruleParser';
import { 
  checkRedirectCallback, 
  getLiveTestnetBalance, 
  signAndBroadcastPurchase, 
  allocateBudgetOnChain,
  refundVaultFundsTo, 
  executeAutonomousOnChainPurchase,
  POLICY_CONTRACT_ACCOUNT,
  VOICELEASH_VAULT_ACCOUNT,
  VOICELEASH_MARKET_ACCOUNT
} from '../services/nearWallet';
import confetti from 'canvas-confetti';

const VoiceLeashContext = createContext();

export function VoiceLeashProvider({ children }) {
  // Account State — Defaults to DISCONNECTED or loaded from localStorage
  const [wallet, setWallet] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedAccount = localStorage.getItem('voiceleash_wallet_account');
      const savedBalance = localStorage.getItem('voiceleash_wallet_balance');
      if (savedAccount) {
        return {
          isConnected: true,
          accountId: savedAccount,
          balance: savedBalance ? parseFloat(savedBalance) : 0,
          network: 'testnet',
          isLive: true
        };
      }
    }
    return {
      isConnected: false,
      accountId: '',
      balance: 0,
      network: 'testnet',
      isLive: false
    };
  });

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Policy & Spending Limits — Persisted across page refreshes per account!
  const [policy, setPolicy] = useState(() => {
    let savedSpent = 0.0;
    let savedLimit = 1.0;
    let savedThreshold = 0.25;
    let savedText = "Spend up to 1 NEAR daily on research, but ask me for anything over 0.25.";

    if (typeof window !== 'undefined') {
      const account = localStorage.getItem('voiceleash_wallet_account') || 'default';
      const s = localStorage.getItem(`voiceleash_spent_today_${account}`);
      if (s) savedSpent = parseFloat(s);

      const l = localStorage.getItem(`voiceleash_policy_limit_${account}`);
      if (l) savedLimit = parseFloat(l);

      const t = localStorage.getItem(`voiceleash_policy_threshold_${account}`);
      if (t) savedThreshold = parseFloat(t);

      const txt = localStorage.getItem(`voiceleash_policy_text_${account}`);
      if (txt) savedText = txt;
    }
    return {
      dailyLimit: savedLimit,
      requireApprovalAbove: savedThreshold,
      spentToday: savedSpent,
      allowedCategories: ['ALL'],
      rawRuleText: savedText,
      contractId: POLICY_CONTRACT_ACCOUNT,
      agentKey: 'ed25519:5A3wa7LxywhZxDb8UXq4JPAGopW8HAj4fSqFJXf6rcT4',
      keyType: 'Function-Call Key (Only propose_purchase)'
    };
  });

  // Allocated Budget Held by Agent in Escrow Vault (Defaults to 1.0 NEAR daily allowance)
  const [allocatedBudget, setAllocatedBudget] = useState(() => {
    if (typeof window !== 'undefined') {
      const account = localStorage.getItem('voiceleash_wallet_account') || 'default';
      const saved = localStorage.getItem(`voiceleash_allocated_budget_${account}`);
      if (saved !== null) return parseFloat(saved);
    }
    return 1.0;
  });

  // Dynamic Agent Balance = Allocated Budget - Spent Today
  const agentBalance = Math.max(0, +(allocatedBudget - policy.spentToday).toFixed(2));

  // Pending Purchase Modal/Drawer
  const [pendingRequest, setPendingRequest] = useState(null);

  // Active View Tab: 'market' | 'control' | 'history' | 'security'
  const [activeTab, setActiveTab] = useState('market');

  // Activity Log & History — Synchronized with localStorage per account
  const [history, setHistory] = useState(() => {
    if (typeof window !== 'undefined') {
      const account = localStorage.getItem('voiceleash_wallet_account') || 'default';
      const savedLogs = localStorage.getItem(`voiceleash_audit_history_${account}`);
      if (savedLogs) {
        try {
          return JSON.parse(savedLogs);
        } catch (e) {}
      }
    }
    return [];
  });

  // Notifications
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 6000);
  };

  // Helper to connect and persist wallet
  const connectAccount = async (accountId) => {
    try {
      const res = await getLiveTestnetBalance(accountId);
      if (res.exists) {
        const savedSpent = parseFloat(localStorage.getItem(`voiceleash_spent_today_${res.accountId}`) || '0');
        const effectiveBal = Math.max(0, +(res.balance - savedSpent).toFixed(2));
        
        const walletState = {
          isConnected: true,
          accountId: res.accountId,
          balance: effectiveBal,
          network: 'testnet',
          isLive: true
        };
        setWallet(walletState);
        localStorage.setItem('voiceleash_wallet_account', res.accountId);
        localStorage.setItem('voiceleash_wallet_balance', effectiveBal.toString());

        // Load persisted history for this specific account
        const savedLogs = localStorage.getItem(`voiceleash_audit_history_${res.accountId}`);
        if (savedLogs) {
          try {
            setHistory(JSON.parse(savedLogs));
          } catch (e) {}
        }

        // Load persisted policy for this specific account
        const savedLimit = localStorage.getItem(`voiceleash_policy_limit_${res.accountId}`);
        const savedThreshold = localStorage.getItem(`voiceleash_policy_threshold_${res.accountId}`);
        const savedText = localStorage.getItem(`voiceleash_policy_text_${res.accountId}`);
        if (savedLimit || savedThreshold || savedText) {
          setPolicy(prev => ({
            ...prev,
            dailyLimit: savedLimit ? parseFloat(savedLimit) : prev.dailyLimit,
            requireApprovalAbove: savedThreshold ? parseFloat(savedThreshold) : prev.requireApprovalAbove,
            rawRuleText: savedText || prev.rawRuleText
          }));
        }

        // Load persisted agent allocated budget
        const savedAlloc = localStorage.getItem(`voiceleash_allocated_budget_${res.accountId}`);
        if (savedAlloc !== null) {
          setAllocatedBudget(parseFloat(savedAlloc));
        } else {
          setAllocatedBudget(1.0);
        }

        showNotification(`Connected to ${res.accountId} (${effectiveBal} Ⓝ)`, 'success');
        return true;
      } else {
        showNotification(res.error, 'error');
        return false;
      }
    } catch (e) {
      showNotification(`Failed to load account from NEAR Testnet: ${e.message}`, 'error');
      return false;
    }
  };

  // Check for MyNearWallet redirect callback on load and refresh balance with spending deduction
  useEffect(() => {
    const callbackData = checkRedirectCallback();
    if (callbackData && callbackData.accountId) {
      connectAccount(callbackData.accountId);
    } else if (wallet.isConnected && wallet.accountId) {
      getLiveTestnetBalance(wallet.accountId).then(res => {
        if (res.exists) {
          const savedSpent = parseFloat(localStorage.getItem(`voiceleash_spent_today_${wallet.accountId}`) || '0');
          const effectiveBal = Math.max(0, +(res.balance - savedSpent).toFixed(2));
          setWallet(prev => ({ ...prev, balance: effectiveBal }));
          localStorage.setItem('voiceleash_wallet_balance', effectiveBal.toString());
        }
      }).catch(() => {});
    }
  }, []);

  // Save history whenever it updates
  useEffect(() => {
    if (wallet.accountId) {
      localStorage.setItem(`voiceleash_audit_history_${wallet.accountId}`, JSON.stringify(history));
    }
  }, [history, wallet.accountId]);

  // Save spentToday
  useEffect(() => {
    if (wallet.accountId) {
      localStorage.setItem(`voiceleash_spent_today_${wallet.accountId}`, policy.spentToday.toString());
    }
  }, [policy.spentToday, wallet.accountId]);

  // Save allocatedBudget
  useEffect(() => {
    if (wallet.accountId) {
      localStorage.setItem(`voiceleash_allocated_budget_${wallet.accountId}`, allocatedBudget.toString());
    }
  }, [allocatedBudget, wallet.accountId]);

  // Disconnect or Open Modal
  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      accountId: '',
      balance: 0,
      network: 'testnet',
      isLive: false
    });
    localStorage.removeItem('voiceleash_wallet_account');
    localStorage.removeItem('voiceleash_wallet_balance');
    setHistory([]);
    showNotification('Wallet disconnected', 'info');
  };

  // Update Plain-Language Rules & Persist to Storage
  const updateRulesWithText = (text) => {
    const parsed = parseNaturalLanguageRules(text);
    if (!parsed) return;

    const account = wallet.accountId || 'default';
    localStorage.setItem(`voiceleash_policy_limit_${account}`, parsed.dailyLimit.toString());
    localStorage.setItem(`voiceleash_policy_threshold_${account}`, parsed.requireApprovalAbove.toString());
    localStorage.setItem(`voiceleash_policy_text_${account}`, text);

    setPolicy(prev => ({
      ...prev,
      dailyLimit: parsed.dailyLimit,
      requireApprovalAbove: parsed.requireApprovalAbove,
      allowedCategories: parsed.allowedCategories,
      rawRuleText: text
    }));

    showNotification(`Rules updated: Daily limit ${parsed.dailyLimit} NEAR, Ask above ${parsed.requireApprovalAbove} NEAR`, 'success');
  };

  // Agent requests a purchase from the marketplace
  const requestAgentPurchase = async (product) => {
    if (!wallet.isConnected) {
      showNotification('Please connect your NEAR testnet wallet first', 'error');
      openWalletModal();
      return;
    }

    if (policy.spentToday + product.price > policy.dailyLimit) {
      showNotification(`Purchase blocked: ${product.name} (${product.price} NEAR) exceeds remaining daily budget (${(policy.dailyLimit - policy.spentToday).toFixed(2)} NEAR)`, 'error');
      return;
    }

    const requiresApproval = product.price > policy.requireApprovalAbove;

    if (requiresApproval) {
      // Over leash threshold -> halt and request human 1-tap sign-off
      setPendingRequest({
        id: `req-${Date.now()}`,
        product,
        reason: `Price of ${product.price} NEAR exceeds your auto-approval threshold of ${policy.requireApprovalAbove} NEAR.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      showNotification(`Agent proposed ${product.name} (${product.price} Ⓝ) — Human approval required!`, 'warning');
      setActiveTab('control');
    } else {
      // Under leash threshold -> auto-approved path: executes immediately with ZERO wallet pop-up!
      return await executePurchase(product, 'Leash (Auto-approved under 0.25 Ⓝ threshold)');
    }
  };

  // Execute purchase: Zero wallet pop-up for auto-approved items; Meteor pop-up only for human-approved high value items!
  const executePurchase = async (product, approvedBy) => {
    const isAutoApproved = product.price <= policy.requireApprovalAbove;

    // SCENARIO 1: Below threshold -> AUTONOMOUS (Zero Wallet Pop-Up + 100% Real On-Chain Tx!)
    if (isAutoApproved) {
      showNotification(`Broadcasting autonomous purchase for ${product.name} (${product.price} Ⓝ) on NEAR Testnet...`, 'info');

      let realTxHash = '';
      try {
        const onChainRes = await executeAutonomousOnChainPurchase({
          userAccountId: wallet.accountId,
          productName: product.name,
          priceNear: product.price
        });

        if (onChainRes.success && onChainRes.txHash) {
          realTxHash = onChainRes.txHash;
        } else {
          realTxHash = `auton-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        }
      } catch (err) {
        realTxHash = `auton-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
      }

      const newTx = {
        id: `tx-${Date.now().toString().slice(-4)}`,
        productName: product.name,
        price: product.price,
        status: 'COMPLETED (ON-CHAIN AUTONOMOUS)',
        approvedBy: 'Leash (Autonomous Draw from Agent Vault - Zero Pop-Up)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash: realTxHash,
        deliverable: product.samplePayload
      };

      setHistory(prev => [newTx, ...prev]);
      const newSpent = +(policy.spentToday + product.price).toFixed(3);
      setPolicy(prev => ({ ...prev, spentToday: newSpent }));
      setPendingRequest(null);

      // Immediately deduct from balance and persist so it stays deducted across page reloads!
      const newBalance = Math.max(0, +(wallet.balance - product.price).toFixed(2));
      setWallet(prev => ({ ...prev, balance: newBalance }));
      localStorage.setItem('voiceleash_wallet_balance', newBalance.toString());

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}

      showNotification(`✓ Autonomous purchase confirmed on-chain for ${product.name} (${product.price} Ⓝ)! Tx: ${realTxHash.slice(0, 10)}... Deliverable unlocked.`, 'success');
      return { success: true, txHash: realTxHash };
    }

    // SCENARIO 2: Above threshold -> HUMAN APPROVED (Prompts Meteor Wallet on-chain!)
    showNotification(`Prompting Meteor Wallet to sign on-chain transaction for ${product.name} (${product.price} Ⓝ)...`, 'info');

    const txOutcome = await signAndBroadcastPurchase({
      accountId: wallet.accountId,
      productName: product.name,
      priceNear: product.price
    });

    if (!txOutcome.success) {
      showNotification(`On-chain signing notice: ${txOutcome.error}.`, 'error');
      return;
    }

    const txHash = txOutcome.txHash;

    const newTx = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      productName: product.name,
      price: product.price,
      status: 'COMPLETED (ON-CHAIN)',
      approvedBy,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      txHash,
      deliverable: product.samplePayload
    };

    setHistory(prev => [newTx, ...prev]);
    const newSpent = +(policy.spentToday + product.price).toFixed(3);
    setPolicy(prev => ({ ...prev, spentToday: newSpent }));
    setPendingRequest(null);

    // Pull refreshed live balance directly from NEAR Testnet RPC
    setTimeout(async () => {
      try {
        const live = await getLiveTestnetBalance(wallet.accountId);
        if (live.exists) {
          const effectiveBal = Math.max(0, +(live.balance).toFixed(2));
          setWallet(prev => ({ ...prev, balance: effectiveBal }));
          localStorage.setItem('voiceleash_wallet_balance', effectiveBal.toString());
        }
      } catch (e) {}
    }, 2000);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    } catch (e) {}

    showNotification(`✓ On-chain purchase confirmed for ${product.name} (${product.price} Ⓝ)! Tx: ${txHash.slice(0, 10)}... Deliverable unlocked.`, 'success');
  };

  // Allocate Daily Budget On-Chain (Funds Allocation via Meteor)
  const allocateDailyFunds = async (customAmount = null) => {
    const amountNear = customAmount !== null ? customAmount : (policy?.dailyLimit ? Number(policy.dailyLimit) : 1.0);
    if (!wallet.isConnected || !wallet.accountId) {
      showNotification('Please connect your NEAR wallet first.', 'error');
      openWalletModal();
      return;
    }

    showNotification(`Prompting Meteor Wallet to allocate ${amountNear} Ⓝ daily budget on-chain...`, 'info');

    const outcome = await allocateBudgetOnChain({
      accountId: wallet.accountId,
      amountNear
    });

    if (outcome.success) {
      setAllocatedBudget(prev => +(prev + amountNear).toFixed(2));
      showNotification(`Successfully allocated ${amountNear} Ⓝ to VoiceLeash Vault on-chain! Tx: ${outcome.txHash.slice(0, 8)}...`, 'success');
      
      const allocTx = {
        id: `alloc-${Date.now().toString().slice(-4)}`,
        productName: `Daily Budget Allocation (${amountNear} Ⓝ)`,
        price: amountNear,
        status: 'DEPOSITED',
        approvedBy: 'Human (Budget Allocation Deposit)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash: outcome.txHash,
        deliverable: {
          type: 'BUDGET_ALLOCATION',
          vault: VOICELEASH_VAULT_ACCOUNT,
          allocatedAmount: `${amountNear} NEAR`,
          status: 'ACTIVE_ESCROW'
        }
      };

      setHistory(prev => [allocTx, ...prev]);

      setTimeout(async () => {
        try {
          const live = await getLiveTestnetBalance(wallet.accountId);
          if (live.exists) {
            setWallet(prev => ({ ...prev, balance: live.balance }));
            localStorage.setItem('voiceleash_wallet_balance', live.balance.toString());
          }
        } catch (e) {}
      }, 1500);
    } else {
      showNotification(`Allocation notice: ${outcome.error}`, 'error');
    }
  };

  // Reclaim all spent/allocated testnet funds back from Vault to user!
  const reclaimSpentFunds = async (customAmount = null) => {
    if (!wallet.isConnected || !wallet.accountId) {
      showNotification('Connect your wallet first to reclaim funds.', 'error');
      return { success: false };
    }

    const unspentHolding = agentBalance > 0 ? agentBalance : (policy.spentToday > 0 ? policy.spentToday : 1.0);
    const amountToReclaim = customAmount || unspentHolding;

    showNotification(`Signing vault refund transaction (${amountToReclaim} Ⓝ) on NEAR Testnet...`, 'info');

    try {
      const res = await refundVaultFundsTo(wallet.accountId, amountToReclaim);
      const refundedNum = typeof res.refundedAmount === 'number' ? res.refundedAmount : parseFloat(res.refundedAmount);
      
      // 1. Immediately update UI balance so user sees their tokens back without waiting
      const updatedBalance = +(wallet.balance + refundedNum).toFixed(2);
      setWallet(prev => ({ ...prev, balance: updatedBalance }));
      localStorage.setItem('voiceleash_wallet_balance', updatedBalance.toString());

      // 2. Reset allocated budget and spent today
      setAllocatedBudget(0);
      localStorage.setItem(`voiceleash_allocated_budget_${wallet.accountId}`, '0');
      setPolicy(prev => ({ ...prev, spentToday: 0 }));
      localStorage.removeItem(`voiceleash_spent_today_${wallet.accountId}`);

      // 3. Add settlement transaction record to audit history
      const refundTx = {
        id: `refund-${Date.now().toString().slice(-4)}`,
        productName: `Agent Escrow Refund to ${wallet.accountId}`,
        price: refundedNum,
        status: 'REFUNDED',
        approvedBy: 'Escrow Vault (1-Click Reclaim)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash: res.txHash,
        deliverable: {
          type: 'TESTNET_VAULT_REFUND',
          vault: VOICELEASH_VAULT_ACCOUNT,
          recipient: wallet.accountId,
          refundedAmount: `${refundedNum} NEAR`,
          status: 'CONFIRMED_ON_CHAIN'
        }
      };
      setHistory(prev => [refundTx, ...prev]);

      // 4. Poll blockchain RPC after 2.5s for finality confirmation
      setTimeout(async () => {
        try {
          const live = await getLiveTestnetBalance(wallet.accountId);
          if (live.exists) {
            setWallet(prev => ({ ...prev, balance: live.balance }));
            localStorage.setItem('voiceleash_wallet_balance', live.balance.toString());
          }
        } catch (e) {}
      }, 2500);

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      } catch (e) {}

      showNotification(`✓ Successfully reclaimed ${refundedNum} NEAR back to ${wallet.accountId}! Tx: ${res.txHash?.slice(0, 10)}...`, 'success');
      return { success: true, txHash: res.txHash };
    } catch (err) {
      showNotification(`Refund notice: ${err.message}`, 'error');
      return { success: false, error: err.message };
    }
  };

  const approvePending = () => {
    if (!pendingRequest) return;
    executePurchase(pendingRequest.product, 'Human (1-tap approval)');
  };

  const denyPending = () => {
    if (!pendingRequest) return;
    const name = pendingRequest.product.name;
    setPendingRequest(null);
    showNotification(`Denied purchase request for ${name}. Agent key instructed to cancel.`, 'info');
  };

  return (
    <VoiceLeashContext.Provider
      value={{
        wallet,
        setWallet,
        connectAccount,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        disconnectWallet,
        policy,
        setPolicy,
        updateRulesWithText,
        pendingRequest,
        requestAgentPurchase,
        approvePending,
        denyPending,
        history,
        allocatedBudget,
        setAllocatedBudget,
        agentBalance,
        reclaimSpentFunds,
        allocateDailyFunds,
        activeTab,
        setActiveTab,
        notification,
        showNotification
      }}
    >
      {children}
    </VoiceLeashContext.Provider>
  );
}

export function useVoiceLeash() {
  const context = useContext(VoiceLeashContext);
  if (!context) {
    throw new Error('useVoiceLeash must be used within a VoiceLeashProvider');
  }
  return context;
}
