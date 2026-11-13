/**
 * VoiceLeash Agent Key Provisioning Script
 * Demonstrates generating a limited NEAR Function-Call Key for an AI Agent
 * Scoped strictly to the VoiceLeash Policy Contract (zero fund transfer capability)
 */

import { KeyPair } from 'near-api-js';

export function createAgentLimitedKey(ownerAccountId, contractId = 'policy.voiceleash.testnet') {
  // 1. Generate an ephemeral Ed25519 keypair for the AI Agent
  const agentKeyPair = KeyPair.fromRandom('ed25519');
  const agentPublicKey = agentKeyPair.getPublicKey().toString();

  // 2. Define the FunctionCallPermission payload
  const accessKeyPermission = {
    FunctionCall: {
      // The only smart contract the agent is permitted to invoke:
      receiverId: contractId,
      // The only method the agent is allowed to invoke:
      methodNames: ['propose_purchase'],
      // Pre-allocated gas allowance (0.25 NEAR for tx fees, CANNOT be withdrawn)
      allowance: '250000000000000000000000'
    }
  };

  console.log('----------------------------------------------------');
  console.log('🎤 VoiceLeash — AI Agent Least-Privilege Key Created');
  console.log('----------------------------------------------------');
  console.log(`Agent Public Key: ${agentPublicKey}`);
  console.log(`Allowed Contract: ${accessKeyPermission.FunctionCall.receiverId}`);
  console.log(`Allowed Methods:  ${accessKeyPermission.FunctionCall.methodNames.join(', ')}`);
  console.log('Transfer Rights:  BLOCKED (Function-Call Key cannot transfer funds)');
  console.log('----------------------------------------------------');

  return {
    agentPublicKey,
    agentSecretKey: agentKeyPair.toString(),
    permission: accessKeyPermission
  };
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('delegate-agent-key.js')) {
  createAgentLimitedKey('shopper.testnet');
}
