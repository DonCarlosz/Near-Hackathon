# VoiceLeash — NEAR Hackathon 2026 Project Plan

**Personal Shopper for Your AI Agent**  
Plain-language control + visual marketplace so non-technical users can safely let an agent shop.

**Deadline:** 14 Nov 2026, 23:59 UTC

---

## 1. Project Overview

**Name:** VoiceLeash

**One-liner:**  
Your AI agent’s personal shopper. Set spending rules in plain language (voice or text). The agent browses a clean marketplace of useful digital products and requests purchases — you approve with a tap or a word. The agent only ever holds a limited NEAR function-call key.

**Problem:**  
Most AI agent tools are technical dashboards. Non-technical people want to give an agent a small budget and watch it buy useful things (data, APIs, briefs) without handing over full control or learning about keys.

**Solution:**  
- Connect a NEAR wallet.  
- Set rules by voice or text: “You can spend up to 2 NEAR a day on data, but ask me for anything over 0.4.”  
- Agent shops on a visual marketplace (product cards).  
- Clear approval card shows the exact product + price.  
- Agent never gets a full-access key.

**Uniqueness:**  
After reviewing 800+ submissions on nearhunt.xyz, almost no one has a consumer-style visual marketplace where a non-technical user watches their agent shop and approves purchases of digital goods. Most “leash” tools are technical policy dashboards.

**Tracks:**
- `agents` (Agent Economy)
- `security` (AI Security & Defense)
- `realworld` (Real-World Money)
- Optional: `open`

---

## 2. Core Use Case — Personal Shopper Marketplace

| Product              | Price     | What the agent gets                  |
|----------------------|-----------|--------------------------------------|
| Live Price Feed      | 0.3 NEAR  | Real-time prices for 1 hour          |
| Weather API Access   | 0.15 NEAR | 7-day forecast for any city          |
| Market Summary       | 0.5 NEAR  | AI-generated daily brief             |
| On-chain Research    | 0.8 NEAR  | Wallet activity report               |
| News Digest          | 0.2 NEAR  | 24h curated crypto news              |
| Historical Dataset   | 0.4 NEAR  | 30-day price history (CSV)           |

**Demo flow:**
1. User connects wallet.
2. User sets rules by voice or text.
3. Agent requests a specific product from the shop.
4. User sees a clear product card + “Approve this purchase?”
5. User approves or denies.
6. Approved items appear in History.

---

## 3. How It Uses NEAR (Required)

| Feature                  | How VoiceLeash uses it                                      | Link |
|--------------------------|-------------------------------------------------------------|------|
| Function-Call Keys       | Agent only gets a limited key that can call the policy contract. No full access. | https://docs.near.org/protocol/access-keys |
| NEAR Intents (optional)  | For the actual payment after approval.                      | https://docs.near-intents.org/ |
| NEAR AI Cloud            | Optional for voice-to-rule parsing.                         | https://cloud.near.ai |
| Free AI credits          | Claim $10.                                                  | https://nearbuilders.org/dashboard |
| Tools for AI Agents      | Setup and key management.                                   | https://docs.near.org/getting-started/tools-for-ai |
| Testnet                  | Entire prototype.                                           | https://near-faucet.io |

**Key message for README and demo:**  
“The agent never gets a full-access key. It only receives a function-call key limited to our policy contract. The human controls the rules in plain language.”

---

## 4. UI Direction

- Light beige / cream background (matching nearhackathon.com)
- Structured editorial cards with bracket labels (`[ 01 / DATA ]`)
- Marketplace as the hero with product-like cards
- Control panel with pending approval
- Connect Wallet only (no email/password)
- Voice or text rule setting

**UI reference:** https://nearhackathon.com/#tracks

---

## 5. Minimal Technical Scope

1. Policy contract (testnet): `set_rules`, `propose_purchase`, `approve_purchase`, `deny_purchase`, `get_policy`
2. Frontend: Connect Wallet + Shop + Control + History
3. Agent holds only a function-call key
4. One complete working demo path

---

## 6. Critical Hackathon Links & Rules

| Resource                    | Link |
|-----------------------------|------|
| Hackathon site              | https://nearhackathon.com |
| Tracks                      | https://nearhackathon.com/#tracks |
| Submission form             | https://nearhackathon.com/#apply |
| Full rules (HACKATHON.md)   | https://nearhackathon.com/HACKATHON.md |
| Track starter prompts       | https://github.com/nearai/near-hackathon-prompt-examples |
| Access Keys                 | https://docs.near.org/protocol/access-keys |
| NEAR Intents                | https://docs.near-intents.org/ |
| NEAR AI docs                | https://docs.near.ai/ |
| Claim $10 AI credits        | https://nearbuilders.org/dashboard |
| Tools for AI Agents         | https://docs.near.org/getting-started/tools-for-ai |
| Browse other submissions    | https://nearhunt.xyz |
| Discord                     | https://discord.gg/nearprotocol |

**Must do before deadline:**
- Public GitHub repo
- Demo post on X tagging `@NEARProtocol` + `#NEARHackathon` (video or screenshots)
- Submit both links via the form
- README with clear “Do X → See Y” steps
- Disclose any AI-generated code
- NEAR account for prize payout

---

## 7. Suggested First Prompt for Your Coding Agent

```
Read https://nearhackathon.com/HACKATHON.md.
Build a minimal testnet prototype called VoiceLeash — Personal Shopper for an AI Agent.
- Connect Wallet (no email login)
- Visual marketplace of digital products (price feed, weather API, market summary, etc.)
- Plain-language rules (text or voice)
- Agent only holds a NEAR function-call key
- User must approve purchases above a threshold
- Clear README with Do X → See Y steps
Prioritize a working demo flow over completeness.
```

---

## 8. Files

- `voiceleash-marketplace.html` — Interactive UI prototype
- `voiceleash-plan.md` — This plan

---

**These two files + the links in section 6 cover what you need.**  
Still open `HACKATHON.md` once before you submit to confirm nothing changed.
