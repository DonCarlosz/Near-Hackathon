/**
 * Native NEAR Protocol & Meteor Wallet Integration Service
 * Executes REAL on-chain transactions with Meteor Wallet and supports automated testnet fund reclamation.
 */

import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { Account, KeyPair, keyStores, Near, transactions } from "near-api-js";

const TESTNET_RPC_URL = 'https://rpc.testnet.near.org';
const FASTNEAR_RPC_URL = 'https://test.rpc.fastnear.com';

export const POLICY_CONTRACT_ACCOUNT = 'policy.voiceleash.testnet';
export const VOICELEASH_MARKET_ACCOUNT = 'voiceleash-market.testnet';

// Dedicated VoiceLeash Escrow Vault Account on NEAR Testnet (Pre-funded & Managed by Agent Key)
export const VOICELEASH_VAULT_ACCOUNT = 'voiceleash-vault-3421.testnet';
const VAULT_SECRET_KEY = 'ed25519:4AeEKmFskJFPRttwuxvNTq2AxXbWPLefUz5Y5bRU9HohRoRPYXHhiVxQG2WJVYmrPNVJUmYXgUbDJQqCyR79NkQz';

let selectorPromise = null;

export function getWalletSelector() {
  if (!selectorPromise) {
    selectorPromise = setupWalletSelector({
      network: "testnet",
      modules: [
        setupMeteorWallet()
      ],
    });
  }
  return selectorPromise;
}

/**
 * Format yoctoNEAR string (10^24) into readable NEAR decimal
 */
export function formatYoctoNear(yoctoStr) {
  try {
    const yocto = BigInt(yoctoStr);
    const divisor = 10n ** 24n;
    const integerPart = yocto / divisor;
    const remainder = yocto % divisor;
    
    const remainderScaled = Number(remainder * 100n / divisor);
    const decimalStr = remainderScaled.toString().padStart(2, '0');
    
    return parseFloat(`${integerPart}.${decimalStr}`);
  } catch (e) {
    return 0;
  }
}

/**
 * Convert human NEAR float (e.g. 0.15) to yoctoNEAR string
 */
export function toYoctoNear(nearAmount) {
  const parts = nearAmount.toString().split('.');
  const whole = BigInt(parts[0] || '0') * (10n ** 24n);
  let frac = 0n;
  if (parts[1]) {
    const fracStr = parts[1].padEnd(24, '0').slice(0, 24);
    frac = BigInt(fracStr);
  }
  return (whole + frac).toString();
}

/**
 * Fetch live account state from NEAR Testnet RPC
 */
export async function getLiveTestnetBalance(accountId) {
  if (!accountId || typeof accountId !== 'string') {
    throw new Error('Invalid Account ID');
  }

  const cleanId = accountId.trim().toLowerCase();
  const rpcUrls = [TESTNET_RPC_URL, FASTNEAR_RPC_URL];
  let lastError = null;

  for (const rpcUrl of rpcUrls) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'voiceleash-query',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: cleanId,
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        return {
          exists: false,
          accountId: cleanId,
          balance: 0,
          error: `Account "${cleanId}" not found on NEAR Testnet. Please fund it at near-faucet.io.`,
        };
      }

      const result = data.result;
      const balanceNear = formatYoctoNear(result.amount);

      return {
        exists: true,
        accountId: cleanId,
        balance: balanceNear,
        rawYocto: result.amount,
        storageUsage: result.storage_usage,
        blockHeight: result.block_height,
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All NEAR Testnet RPC endpoints unreachable');
}

/**
 * Sign in with Meteor Wallet Extension
 */
export async function signInWithMeteor() {
  const selector = await getWalletSelector();
  const wallet = await selector.wallet("meteor-wallet");
  
  const accounts = await wallet.signIn({
    contractId: POLICY_CONTRACT_ACCOUNT,
    methodNames: ["propose_purchase"]
  });

  return accounts;
}

/**
 * Sign and broadcast a real on-chain transaction via Meteor Wallet
 * Sends real testnet funds to the VoiceLeash Vault, creating a real on-chain footprint!
 */
export async function signAndBroadcastPurchase({ accountId, productName, priceNear }) {
  try {
    const selector = await getWalletSelector();
    const wallet = await selector.wallet("meteor-wallet");

    const yoctoDeposit = toYoctoNear(priceNear);
    const action = transactions.transfer(yoctoDeposit);

    const outcome = await wallet.signAndSendTransaction({
      signerId: accountId,
      receiverId: VOICELEASH_VAULT_ACCOUNT,
      actions: [action]
    });

    const realTxHash = outcome?.transaction?.hash || outcome?.transaction_outcome?.id;
    if (!realTxHash) {
      throw new Error("No transaction hash returned from NEAR network");
    }

    return {
      success: true,
      txHash: realTxHash
    };
  } catch (err) {
    console.error("Meteor on-chain signing failed:", err);
    return {
      success: false,
      error: err.message || "Failed to sign on-chain transaction"
    };
  }
}

/**
 * Allocate Daily Budget On-Chain via Meteor Wallet
 * Deposits funds into the Vault so the agent can execute micro-purchases
 */
export async function allocateBudgetOnChain({ accountId, amountNear }) {
  try {
    const selector = await getWalletSelector();
    const wallet = await selector.wallet("meteor-wallet");

    const yoctoDeposit = toYoctoNear(amountNear);
    const action = transactions.transfer(yoctoDeposit);

    const outcome = await wallet.signAndSendTransaction({
      signerId: accountId,
      receiverId: VOICELEASH_VAULT_ACCOUNT,
      actions: [action]
    });

    const realTxHash = outcome?.transaction?.hash || outcome?.transaction_outcome?.id;
    return {
      success: true,
      txHash: realTxHash
    };
  } catch (err) {
    console.error("Allocation signing failed:", err);
    return {
      success: false,
      error: err.message || "Failed to allocate budget on-chain"
    };
  }
}

/**
 * Query current Vault balance on testnet
 */
export async function getVaultBalance() {
  try {
    const res = await getLiveTestnetBalance(VOICELEASH_VAULT_ACCOUNT);
    return res.exists ? res.balance : 0;
  } catch {
    return 0;
  }
}

/**
 * Execute Autonomous Purchase On-Chain via VoiceLeash Agent Vault
 * Signs with the Agent Vault's keypair directly in memory and broadcasts to NEAR Testnet RPC.
 * Result: 100% REAL on-chain transaction hash on Nearblocks with ZERO wallet pop-ups!
 */
export async function executeAutonomousOnChainPurchase({ userAccountId, productName, priceNear }) {
  try {
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = KeyPair.fromString(VAULT_SECRET_KEY);
    await keyStore.setKey('testnet', VOICELEASH_VAULT_ACCOUNT, keyPair);

    const near = new Near({
      networkId: 'testnet',
      keyStore,
      nodeUrl: TESTNET_RPC_URL
    });

    const vaultAccount = new Account(near.connection, VOICELEASH_VAULT_ACCOUNT);
    const yoctoDeposit = toYoctoNear(priceNear);

    // Broadcast real on-chain transfer from Agent Vault to Marketplace Provider on NEAR Testnet!
    const result = await vaultAccount.sendMoney(VOICELEASH_MARKET_ACCOUNT, yoctoDeposit);

    return {
      success: true,
      txHash: result?.transaction?.hash,
      signerId: VOICELEASH_VAULT_ACCOUNT,
      receiverId: VOICELEASH_MARKET_ACCOUNT
    };
  } catch (err) {
    console.error("Autonomous on-chain transaction failed:", err);
    return {
      success: false,
      error: err.message || "Failed to broadcast autonomous transaction"
    };
  }
}

/**
 * Reclaim / Refund Testnet Funds from VoiceLeash Vault back to user account!
 * Ensures user funds are never lost permanently while testing.
 */
export async function refundVaultFundsTo(userAccountId, requestedAmount = null) {
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(VAULT_SECRET_KEY);
  await keyStore.setKey('testnet', VOICELEASH_VAULT_ACCOUNT, keyPair);

  const near = new Near({
    networkId: 'testnet',
    keyStore,
    nodeUrl: TESTNET_RPC_URL
  });

  const vaultAccount = new Account(near.connection, VOICELEASH_VAULT_ACCOUNT);
  
  try {
    const balance = await vaultAccount.getAccountBalance();
    const availableYocto = BigInt(balance.available);
    const gasBuffer = 10000000000000000000000n; // 0.01 NEAR reserve for gas

    if (availableYocto <= gasBuffer) {
      throw new Error('No reclaimable test funds in the vault currently.');
    }

    let refundYocto;
    if (requestedAmount && requestedAmount > 0) {
      const targetYocto = BigInt(toYoctoNear(requestedAmount));
      refundYocto = targetYocto < (availableYocto - gasBuffer) ? targetYocto.toString() : (availableYocto - gasBuffer).toString();
    } else {
      refundYocto = (availableYocto - gasBuffer).toString();
    }

    const result = await vaultAccount.sendMoney(userAccountId, refundYocto);
    
    return {
      success: true,
      txHash: result?.transaction?.hash,
      refundedAmount: formatYoctoNear(refundYocto)
    };
  } catch (err) {
    throw new Error(err.message || 'Failed to refund vault funds');
  }
}

/**
 * Check if the browser just returned from wallet redirect
 */
export function checkRedirectCallback() {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get('account_id');
  const allKeys = urlParams.get('all_keys');

  if (accountId) {
    window.history.replaceState({}, document.title, window.location.pathname);
    return { accountId, allKeys };
  }
  return null;
}
