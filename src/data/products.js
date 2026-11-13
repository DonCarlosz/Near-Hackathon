export const MARKETPLACE_PRODUCTS = [
  {
    id: "prod-01",
    trackId: "[ 01 / DFI ]",
    cat: "LIVE FEED",
    name: "Live Price Feed",
    headline: "Markets that never sleep",
    description: "Real-time crypto and asset prices for 1 hour. Clean JSON endpoint optimized for LLM tool consumption.",
    price: 0.3,
    iconType: "arrows",
    tags: ["DATA", "API", "REAL-TIME"],
    deliverableType: "json",
    samplePayload: {
      timestamp: new Date().toISOString(),
      source: "near-oracle-network",
      assets: {
        NEAR: { price_usd: 5.42, change_24h: "+4.8%" },
        BTC: { price_usd: 94250.00, change_24h: "+2.1%" },
        ETH: { price_usd: 3410.50, change_24h: "+1.9%" }
      },
      status: "active_1h"
    }
  },
  {
    id: "prod-02",
    trackId: "[ 02 / API ]",
    cat: "WEATHER",
    name: "Weather API Access",
    headline: "Forecast for any coordinate",
    description: "7-day global forecast endpoint for any city. Agent-ready JSON structure with temperature, rain probability, and wind.",
    price: 0.15,
    iconType: "weather",
    tags: ["API", "FORECAST", "GEODATA"],
    deliverableType: "json",
    samplePayload: {
      location: "San Francisco, CA",
      forecast_days: 7,
      summary: "Mild with partial clouds",
      high_c: 19,
      low_c: 12,
      rain_chance: "15%"
    }
  },
  {
    id: "prod-03",
    trackId: "[ 03 / INV ]",
    cat: "INVESTMENT THESIS",
    name: "Market Summary",
    headline: "Make the long-term case",
    description: "AI-synthesized daily crypto macro intelligence report. Concise, high-density context for agent strategy planning.",
    price: 0.5,
    iconType: "bars",
    tags: ["SUMMARY", "AI", "MACRO"],
    deliverableType: "markdown",
    samplePayload: {
      title: "Daily Market Intelligence Brief",
      generated_by: "NEAR AI Cloud Synthesizer",
      key_takeaway: "DeFi volumes up 18% following chain-abstraction primitives rollout. NEAR ecosystem TVL expanding across AI tracks.",
      risk_index: "Moderate (42/100)"
    }
  },
  {
    id: "prod-04",
    trackId: "[ 04 / PRV ]",
    cat: "PRIVACY & DEFENSE",
    name: "On-chain Research",
    headline: "Private by design",
    description: "Wallet activity and flow report. Scans on-chain contracts without leaking identity or intent.",
    price: 0.8,
    iconType: "lock",
    tags: ["RESEARCH", "NEAR", "ANALYTICS"],
    deliverableType: "json",
    samplePayload: {
      target_contract: "policy.voiceleash.testnet",
      active_delegated_keys: 142,
      avg_gas_consumed_tgas: 4.8,
      verified_safeguards: "Enforced 100%"
    }
  },
  {
    id: "prod-05",
    trackId: "[ 05 / DGT ]",
    cat: "NEWS DIGEST",
    name: "News Digest",
    headline: "Intelligence in 60 seconds",
    description: "Curated crypto news from the last 24 hours. AI summarizes sentiment and market catalysts.",
    price: 0.2,
    iconType: "news",
    tags: ["NEWS", "24H", "SENTIMENT"],
    deliverableType: "json",
    samplePayload: {
      items_count: 5,
      top_headline: "NEAR Protocol Announces Record Autonomous Agent Growth in Q4",
      sentiment_score: 0.84,
      catalysts: ["Chain Abstraction 2.0 Live", "Zero-Knowledge Intents Bridge"]
    }
  },
  {
    id: "prod-06",
    trackId: "[ 06 / DTA ]",
    cat: "HISTORICAL DATA",
    name: "Historical Dataset",
    headline: "30-day verified history",
    description: "30-day granular price, volume, and volatility history provided as downloadable CSV format.",
    price: 0.4,
    iconType: "dataset",
    tags: ["CSV", "HISTORY", "OFFLINE"],
    deliverableType: "csv",
    samplePayload: "date,asset,open,high,low,close,volume\n2026-11-01,NEAR,5.10,5.32,5.05,5.25,1245000\n2026-11-02,NEAR,5.25,5.40,5.18,5.38,1310000\n2026-11-03,NEAR,5.38,5.55,5.35,5.42,1420000"
  },
  {
    id: "prod-07",
    trackId: "[ 07 / INT ]",
    cat: "NEAR INTENTS",
    name: "Intents Solver Route",
    headline: "Swap across any chain",
    description: "Decentralized solver network endpoint executing cross-chain intent routing between NEAR, Bitcoin, and Solana.",
    price: 0.18,
    iconType: "intents",
    tags: ["INTENTS", "CROSS-CHAIN", "SOLVER"],
    deliverableType: "json",
    samplePayload: {
      route_id: "near-intent-8902",
      source_asset: "NEAR",
      target_asset: "BTC (Native)",
      estimated_execution_ms: 1200,
      best_solver: "solver-alpha.testnet",
      slippage_guarantee: "< 0.05%"
    }
  },
  {
    id: "prod-08",
    trackId: "[ 08 / TEE ]",
    cat: "CONFIDENTIAL COMPUTE",
    name: "TEE Enclave Compute",
    headline: "Hardware-isolated secrets",
    description: "Cryptographic enclave compute time on NEAR AI Cloud for confidential prompt evaluation and key generation.",
    price: 0.45,
    iconType: "tee",
    tags: ["SECURITY", "TEE", "CONFIDENTIAL"],
    deliverableType: "json",
    samplePayload: {
      enclave_id: "sgx-enclave-v2.near",
      hardware: "AMD SEV-SNP Verified",
      attestation_hash: "0x89e2cf4b...881a",
      isolated_state: "active",
      tamper_risk: "0.00%"
    }
  },
  {
    id: "prod-09",
    trackId: "[ 09 / RPC ]",
    cat: "FAST INFRA",
    name: "Dedicated Fastnear Node",
    headline: "Sub-second block queries",
    description: "10,000 request pass for enterprise-tier testnet and mainnet archival RPC. Zero rate limits for agent loops.",
    price: 0.1,
    iconType: "rpc",
    tags: ["INFRA", "RPC", "SPEED"],
    deliverableType: "json",
    samplePayload: {
      endpoint: "https://test.rpc.fastnear.com",
      auth_token: "fn_pass_live_8923a1",
      allocated_queries: 10000,
      avg_latency_ms: 28,
      status: "unthrottled"
    }
  },
  {
    id: "prod-10",
    trackId: "[ 10 / LLM ]",
    cat: "NEAR AI CLOUD",
    name: "Llama-3-70B Inference",
    headline: "Open-source agent reasoning",
    description: "Pre-allocated 50,000 input/output tokens on decentralized NEAR AI inference nodes for complex decision pipelines.",
    price: 0.22,
    iconType: "llm",
    tags: ["AI", "LLM", "INFERENCE"],
    deliverableType: "json",
    samplePayload: {
      model: "meta-llama/Meta-Llama-3-70B-Instruct",
      token_quota: 50000,
      host_network: "near-ai-distributed-cloud",
      context_window: 8192,
      latency_p90: "450ms"
    }
  },
  {
    id: "prod-11",
    trackId: "[ 11 / MPC ]",
    cat: "CHAIN SIGNATURES",
    name: "Chain Signature MPC Quota",
    headline: "One key controls all chains",
    description: "Threshold MPC signature allocation allowing your agent to sign transactions on Bitcoin and Ethereum from NEAR.",
    price: 0.6,
    iconType: "mpc",
    tags: ["CHAIN-SIG", "MPC", "MULTI-CHAIN"],
    deliverableType: "json",
    samplePayload: {
      mpc_contract: "v1.signer-prod.testnet",
      key_derivation_path: "near/ai-agent/shopper",
      supported_chains: ["Bitcoin", "Ethereum", "Solana", "Dogecoin"],
      derivation_status: "verified"
    }
  },
  {
    id: "prod-12",
    trackId: "[ 12 / ZKP ]",
    cat: "ZERO-KNOWLEDGE",
    name: "ZK Verification Proof",
    headline: "Prove without revealing",
    description: "Succinct SNARK proof certifying agent shopping compliance against your leash parameters without disclosing budget limits.",
    price: 0.35,
    iconType: "zk",
    tags: ["ZK", "PROOF", "PRIVACY"],
    deliverableType: "json",
    samplePayload: {
      proof_system: "Groth16 SNARK",
      curve: "BN254",
      public_inputs: ["hash(leash_rules)", "total_spend_valid"],
      verification_status: "PASSED",
      zero_knowledge_leak: "NONE"
    }
  }
];
