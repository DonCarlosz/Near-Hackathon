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
      sentiment_score: 0.84
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
  }
];
