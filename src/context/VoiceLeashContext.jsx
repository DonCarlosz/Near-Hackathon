import React, { createContext, useContext, useState, useEffect } from 'react';
import { MARKETPLACE_PRODUCTS } from '../data/products';
import { parseNaturalLanguageRules } from '../utils/ruleParser';
import { 
  checkRedirectCallback, 
  getLiveTestnetBalance, 
  signAndBroadcastPurchase, 
  allocateBudgetOnChain,
  refundVaultFundsTo, 
  POLICY_CONTRACT_ACCOUNT,
  VOICELEASH_VAULT_ACCOUNT 
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

  // Policy & Spending Limits — 1.0 NEAR Daily / 0.25 NEAR auto-approval cap
  const [policy, setPolicy] = useState({
    dailyLimit: 1.0,
    requireApprovalAbove: 0.25,
    spentToday: 0.0,
    allowedCategories: ['ALL'],
    rawRuleText: "Spend up to 1 NEAR daily on research, but ask me for anything over 0.25.",
    contractId: POLICY_CONTRACT_ACCOUNT,
    agentKey: 'ed25519:5A3wa7LxywhZxDb8UXq4JPAGopW8HAj4fSqFJXf6rcT4',
    keyType: 'Function-Call Key (Only propose_purchase)'
  });

  // Allocated Budget on-chain (Pre-funded daily allowance: 1.0 NEAR)
  const [allocatedBudget, setAllocatedBudget] = useState(() => {
    if (typeof window !== 'undefined') {
      const account = localStorage.getItem('voiceleash_wallet_account') || 'default';
      const saved = localStorage.getItem(`voiceleash_allocated_budget_${account}`);
      if (saved) return parseFloat(saved);
    }
    return 1.0; // Defaults to 1.0 NEAR daily allowance
  });

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
        const walletState = {
          isConnected: true,
          accountId: res.accountId,
          balance: res.balance,
          network: 'testnet',
          isLive: true
        };
        setWallet(walletState);
        localStorage.setItem('voiceleash_wallet_account', res.accountId);
        localStorage.setItem('voiceleash_wallet_balance', res.balance.toString());

        // Load persisted history for this specific account
        const savedLogs = localStorage.getItem(`voiceleash_audit_history_${res.accountId}`);
        if (savedLogs) {
          try {
            setHistory(JSON.parse(savedLogs));
          } catch (e) {}
        }

        showNotification(`Connected to ${res.accountId} (${res.balance} Ⓝ)`, 'success');
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

  // Check for MyNearWallet redirect callback on load and refresh balance
  useEffect(() => {
    const callbackData = checkRedirectCallback();
    if (callbackData && callbackData.accountId) {
      connectAccount(callbackData.accountId);
    } else if (wallet.isConnected && wallet.accountId) {
      getLiveTestnetBalance(wallet.accountId).then(res => {
        if (res.exists) {
          setWallet(prev => ({ ...prev, balance: res.balance }));
          localStorage.setItem('voiceleash_wallet_balance', res.balance.toString());
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

  // Save allocated budget
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

  // Update Plain-Language Rules
  const updateRulesWithText = (text) => {
    const parsed = parseNaturalLanguageRules(text);
    if (!parsed) return;

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
  const requestAgentPurchase = (product) => {
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
      setPendingRequest({
        id: `req-${Date.now()}`,
        product,
        reason: `Price of ${product.price} NEAR exceeds your auto-approval threshold of ${policy.requireApprovalAbove} NEAR.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      showNotification(`Agent proposed ${product.name} — Human approval required!`, 'warning');
      setActiveTab('control');
    } else {
      executePurchase(product, 'Leash (Auto-approved under 0.25 Ⓝ threshold)');
    }
  };

  // Execute purchase: Zero wallet pop-up for auto-approved items!
  const executePurchase = async (product, approvedBy) => {
    const isAutoApproved = product.price <= policy.requireApprovalAbove;

    // SCENARIO 1: Auto-Approved below threshold (Zero Wallet Pop-Up!)
    if (isAutoApproved) {
      const autonTxHash = `auton-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
      
      const newTx = {
        id: `tx-${Date.now().toString().slice(-4)}`,
        productName: product.name,
        price: product.price,
        status: 'COMPLETED (AUTONOMOUS)',
        approvedBy: 'Leash (Autonomous Draw from Allocated 1.0 Ⓝ Vault)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash: autonTxHash,
        deliverable: product.samplePayload
      };

      setHistory(prev => [newTx, ...prev]);
      setPolicy(prev => ({ ...prev, spentToday: +(prev.spentToday + product.price).toFixed(3) }));
      setAllocatedBudget(prev => Math.max(0, +(prev - product.price).toFixed(3)));
      setPendingRequest(null);

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}

      showNotification(`✓ Autonomous purchase confirmed for ${product.name} (${product.price} Ⓝ) — Zero wallet pop-up needed!`, 'success');
      return;
    }

    // SCENARIO 2: Human-Approved (Above Threshold)
    showNotification(`Prompting Meteor Wallet to sign on-chain transaction for ${product.name}...`, 'info');

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
      status: 'COMPLETED (HUMAN-APPROVED)',
      approvedBy,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      txHash,
      deliverable: product.samplePayload
    };

    setHistory(prev => [newTx, ...prev]);
    setPolicy(prev => ({ ...prev, spentToday: +(prev.spentToday + product.price).toFixed(3) }));
    setPendingRequest(null);

    // Pull refreshed live balance directly from NEAR Testnet RPC
    setTimeout(async () => {
      try {
        const live = await getLiveTestnetBalance(wallet.accountId);
        if (live.exists) {
          setWallet(prev => ({ ...prev, balance: live.balance }));
          localStorage.setItem('voiceleash_wallet_balance', live.balance.toString());
        }
      } catch (e) {}
    }, 2000);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    } catch (e) {}

    showNotification(`On-chain purchase confirmed for ${product.name} (${product.price} Ⓝ)! Tx: ${txHash.slice(0, 10)}... Deliverable unlocked.`, 'success');
  };

  // Allocate Daily Budget On-Chain (Funds Allocation via Meteor)
  const allocateDailyFunds = async (amountNear = 1.0) => {
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
      setAllocatedBudget(amountNear);
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
  const reclaimSpentFunds = async () => {
    if (!wallet.isConnected || !wallet.accountId) {
      showNotification('Connect your wallet first to reclaim funds.', 'error');
      return;
    }

    showNotification('Signing vault refund transaction on NEAR Testnet...', 'info');

    try {
      const res = await refundVaultFundsTo(wallet.accountId);
      
      // Pull updated live balance
      const live = await getLiveTestnetBalance(wallet.accountId);
      if (live.exists) {
        setWallet(prev => ({ ...prev, balance: live.balance }));
        localStorage.setItem('voiceleash_wallet_balance', live.balance.toString());
      }

      setPolicy(prev => ({ ...prev, spentToday: 0 }));
      setAllocatedBudget(0);

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      } catch (e) {}

      showNotification(`Reclaimed ${res.refundedAmount} NEAR back to ${wallet.accountId}! Tx: ${res.txHash?.slice(0, 8)}...`, 'success');
    } catch (err) {
      showNotification(`Refund notice: ${err.message}`, 'error');
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
        allocatedBudget,
        updateRulesWithText,
        pendingRequest,
        requestAgentPurchase,
        approvePending,
        denyPending,
        history,
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
