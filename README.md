# 🎤 VoiceLeash — Personal Shopper for Your AI Agent

> **Plain-language control + visual marketplace so non-technical users can safely let an AI agent shop.**  
> Built for the **NEAR Hackathon 2026** (Deadline: 14 Nov 2026, 23:59 UTC).  
> **GitHub Repository:** [https://github.com/DonCarlosz/Near-Hackathon](https://github.com/DonCarlosz/Near-Hackathon)

---

## 🏆 Hackathon Tracks

* **`agents` (Agent Economy):** Autonomous shopper agents browsing and consuming digital goods (data feeds, weather APIs, market summaries) to execute high-level goals.
* **`security` (AI Security & Defense):** Zero-trust key delegation. The agent never holds a Full-Access key; it receives only a restricted NEAR Function-Call Access Key limited strictly to `propose_purchase`.
* **`realworld` (Real-World Money):** Consumer-grade UX bringing plain-language budgeting, one-time daily funding, zero-popup autonomous execution, and 1-tap human approvals to everyday users.

---

## 💡 The Problem & The Solution

| The Problem | VoiceLeash Solution |
| :--- | :--- |
| **Technical Barrier:** Most agent policy tools are developer consoles or raw JSON dashboards. Everyday users cannot safely budget for an agent. | **Plain-Language Leash:** Speak or type natural language: *"Spend up to 1 NEAR daily on research, but ask me for anything over 0.25."* |
| **Runaway Spending & Wallet Drainage:** If an AI agent has a full private key, a prompt injection or bug can drain 100% of user funds. | **Cryptographic Function-Call Key:** The agent is mathematically barred by the NEAR protocol runtime from transferring funds or re-keying accounts. |
| **Constant Nagging & Friction:** Asking the human to sign a wallet pop-up for every single micro-payment destroys agent autonomy. | **Pre-Funded Daily Allowance:** Human deposits daily budget (1.0 NEAR) on-chain once. Micro-purchases under threshold execute with **zero wallet pop-ups**! |
| **No Consumer Marketplace:** Agents have no standardized, visual store to acquire on-chain capabilities. | **Curated Storefront:** Clean, editorial marketplace of 6 utility products with verified deliverables (JSON, CSV, Markdown). |
| **Fear of Lost Test Funds:** Users fear losing their limited testnet tokens while experimenting. | **Zero-Loss Escrow Vault & Reclaim:** All spent funds are held in the VoiceLeash Vault and can be refunded back to the user's wallet anytime with 1 click. |

---

## ⚡ Quickstart: "Do X → See Y" Demo Flow

### 1. Run the Application Locally
```bash
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Step-by-Step Judging Walkthrough
1. **Connect Wallet (`Do X`):** Click **Connect Wallet ↗** → **Sign in with Meteor Wallet ↗** (or enter testnet account `d4rc.testnet`).  
   → **See Y:** Header displays your live testnet balance queried straight from the NEAR Testnet RPC.
2. **Deposit Daily Budget On-Chain (`Do X`):** Under **Leash Rules**, click **"Deposit 1.0 Ⓝ On-Chain ↗"**. Meteor pops up once to confirm.  
   → **See Y:** 1.0 NEAR is deposited into the VoiceLeash Policy Vault on NEAR Testnet.
3. **Give the Agent a High-Level Goal (`Do X`):** In **Shop**, type any goal (e.g., *"Check 7-day weather forecast"* or *"Summarize latest news"*) and click **Run Agent ↗**.  
   → **See Y:** The autonomous resolver dynamically matches the exact capability from the marketplace (e.g. *Weather API Access* at `0.15 Ⓝ` or *News Digest* at `0.20 Ⓝ`).
4. **Autonomous Execution with ZERO Pop-Ups (`Do X`):** Watch the live reasoning feed.  
   → **See Y:** Because `0.15 Ⓝ ≤ 0.25 Ⓝ` leash cap, the agent executes the purchase autonomously against the deposited allowance **with ZERO wallet pop-up interruption**! Confetti fires and real deliverables unlock.
5. **High-Value Interception (`Do X`):** Click **Agent Buy ↗** on **Market Summary (0.50 Ⓝ)** or **On-chain Research (0.80 Ⓝ)**.  
   → **See Y:** Price exceeds the `0.25 Ⓝ` threshold! The agent halts execution and presents an intercepted proposal card: `[ ⚠️ INTERCEPTED — HUMAN APPROVAL REQUIRED ]`.
6. **Human 1-Tap Approval (`Do X`):** Click **Approve (1-Tap) ↗**.  
   → **See Y:** Purchase executes upon human decision and is recorded in **Audit Logs**.
7. **Inspect & Export Deliverables (`Do X`):** Navigate to **Audit Logs**.  
   → **See Y:** Inspect payloads and export in JSON or CSV. All entries are persisted in local storage keyed to the account.
8. **Reclaim Test Funds (`Do X`):** Navigate to **Leash Rules** → **[ 04 / TESTNET VAULT & REFUND ]** and click **Reclaim Test Funds ↺**.  
   → **See Y:** The Vault signs a transaction on NEAR Testnet and refunds 100% of accumulated testnet funds back to your wallet.

---

## 🔒 Cryptographic Security Architecture

```
+-------------------------------------------------------------+
|                     HUMAN USER WALLET                       |
|               (Holds Full-Access Private Key)               |
+-------------------------------------------------------------+
                               |
         1. Generates Limited Function-Call Access Key
                               v
+-------------------------------------------------------------+
|                   AI AGENT RUNTIME / SHOPPER                |
|           (Holds Ed25519 Function-Call Access Key)           |
+-------------------------------------------------------------+
                               |
   2. Invokes strictly: propose_purchase() on Policy Contract
                               v
+-------------------------------------------------------------+
|                 VOICELEASH POLICY CONTRACT                  |
|                 (policy.voiceleash.testnet)                 |
+-------------------------------------------------------------+
        |                                             |
   Under Leash? (≤ 0.25 Ⓝ)                       Over Leash? (> 0.25 Ⓝ)
        |                                             |
        v                                             v
[ AUTO-EXECUTES ]                              [ HALTS & REQUESTS ]
(Draws from 1.0 Ⓝ budget                       (Human 1-tap approval card
with 0 wallet pop-ups)                          in frontend)
```

---

## 📄 License & Hackathon Details

Built by the VoiceLeash Team for NEAR Hackathon 2026.  
All smart contract code located in `contracts/VoiceLeashPolicy.rs`.
