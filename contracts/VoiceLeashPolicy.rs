use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, require, AccountId, NearToken, PanicOnDefault, Promise};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct PolicyRule {
    pub daily_limit: NearToken,
    pub require_approval_above: NearToken,
    pub spent_today: NearToken,
    pub allocated_budget: NearToken,
    pub last_spend_timestamp: u64,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub enum PurchaseStatus {
    PendingApproval,
    Approved,
    Denied,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct PurchaseRequest {
    pub id: u64,
    pub agent_id: AccountId,
    pub item_name: String,
    pub price: NearToken,
    pub receiver_id: AccountId,
    pub status: PurchaseStatus,
    pub created_at: u64,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct VoiceLeashContract {
    pub owner_id: AccountId,
    pub policy: PolicyRule,
    pub requests: LookupMap<u64, PurchaseRequest>,
    pub request_counter: u64,
}

#[near_bindgen]
impl VoiceLeashContract {
    #[init]
    pub fn new(daily_limit: U128, require_approval_above: U128) -> Self {
        Self {
            owner_id: env::predecessor_account_id(),
            policy: PolicyRule {
                daily_limit: NearToken::from_yoctonear(daily_limit.0),
                require_approval_above: NearToken::from_yoctonear(require_approval_above.0),
                spent_today: NearToken::from_yoctonear(0),
                allocated_budget: NearToken::from_yoctonear(0),
                last_spend_timestamp: env::block_timestamp(),
            },
            requests: LookupMap::new(b"r"),
            request_counter: 0,
        }
    }

    /// Owner allocates daily funds into the smart contract (1-time on-chain sign)
    /// Enables the agent to execute micro-purchases autonomously with ZERO wallet pop-ups!
    #[payable]
    pub fn deposit_budget(&mut self) {
        require!(env::predecessor_account_id() == self.owner_id, "Only owner can deposit budget");
        let deposit = env::attached_deposit();
        require!(deposit.as_yoctonear() > 0, "Attached deposit must be greater than 0");
        
        let new_allocated = self.policy.allocated_budget.as_yoctonear() + deposit.as_yoctonear();
        self.policy.allocated_budget = NearToken::from_yoctonear(new_allocated);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"voiceleash\",\"version\":\"1.0.0\",\"event\":\"budget_deposited\",\"data\":[{{\"owner_id\":\"{}\",\"amount\":\"{}\"}}]}}",
            self.owner_id, deposit.as_yoctonear()
        ));
    }

    /// Owner (Human with Full-Access Key) updates plain-language limits
    pub fn set_policy(&mut self, daily_limit: U128, require_approval_above: U128) {
        require!(env::predecessor_account_id() == self.owner_id, "Only owner can update policy");
        self.policy.daily_limit = NearToken::from_yoctonear(daily_limit.0);
        self.policy.require_approval_above = NearToken::from_yoctonear(require_approval_above.0);
    }

    /// AI Agent (holding only Function-Call Key) proposes a purchase
    /// If price <= require_approval_above and budget is allocated:
    /// AUTO-APPROVES and transfers funds from allocated pool with ZERO human popup!
    pub fn propose_purchase(&mut self, item_name: String, price: U128, receiver_id: AccountId) -> u64 {
        let price_tokens = NearToken::from_yoctonear(price.0);
        
        // Reset 24-hour spending counter if a day has passed
        let current_time = env::block_timestamp();
        if current_time - self.policy.last_spend_timestamp > 86_400_000_000_000 {
            self.policy.spent_today = NearToken::from_yoctonear(0);
            self.policy.last_spend_timestamp = current_time;
        }

        let new_total = self.policy.spent_today.as_yoctonear() + price_tokens.as_yoctonear();
        require!(
            new_total <= self.policy.daily_limit.as_yoctonear(),
            "Purchase exceeds daily spending leash limit"
        );

        let req_id = self.request_counter;
        self.request_counter += 1;

        // Auto-approve if below approval threshold and covered by allocated budget
        let status = if price_tokens.as_yoctonear() <= self.policy.require_approval_above.as_yoctonear() {
            require!(
                self.policy.allocated_budget.as_yoctonear() >= price_tokens.as_yoctonear(),
                "Insufficient allocated budget in policy escrow"
            );

            // Deduct from allocated budget and increment spent_today
            self.policy.allocated_budget = NearToken::from_yoctonear(
                self.policy.allocated_budget.as_yoctonear() - price_tokens.as_yoctonear()
            );
            self.policy.spent_today = NearToken::from_yoctonear(new_total);

            // Autonomous payout directly to capability provider
            Promise::new(receiver_id.clone()).transfer(price_tokens);

            env::log_str(&format!(
                "EVENT_JSON:{{\"standard\":\"voiceleash\",\"version\":\"1.0.0\",\"event\":\"autonomous_purchase_executed\",\"data\":[{{\"item\":\"{}\",\"price\":\"{}\",\"receiver\":\"{}\"}}]}}",
                item_name, price_tokens.as_yoctonear(), receiver_id
            ));

            PurchaseStatus::Approved
        } else {
            PurchaseStatus::PendingApproval
        };

        let req = PurchaseRequest {
            id: req_id,
            agent_id: env::predecessor_account_id(),
            item_name,
            price: price_tokens,
            receiver_id,
            status,
            created_at: current_time,
        };

        self.requests.insert(&req_id, &req);
        req_id
    }

    /// Human approves a pending purchase with 1-tap
    pub fn approve_purchase(&mut self, request_id: u64) {
        require!(env::predecessor_account_id() == self.owner_id, "Only human owner can approve");
        let mut req = self.requests.get(&request_id).expect("Request not found");
        require!(matches!(req.status, PurchaseStatus::PendingApproval), "Not pending approval");

        let new_total = self.policy.spent_today.as_yoctonear() + req.price.as_yoctonear();
        require!(new_total <= self.policy.daily_limit.as_yoctonear(), "Exceeds daily budget");

        self.policy.spent_today = NearToken::from_yoctonear(new_total);
        req.status = PurchaseStatus::Approved;
        self.requests.insert(&request_id, &req);

        // Execute payment to provider
        Promise::new(req.receiver_id).transfer(req.price);
    }

    /// Human denies a purchase
    pub fn deny_purchase(&mut self, request_id: u64) {
        require!(env::predecessor_account_id() == self.owner_id, "Only human owner can deny");
        let mut req = self.requests.get(&request_id).expect("Request not found");
        req.status = PurchaseStatus::Denied;
        self.requests.insert(&request_id, &req);
    }

    /// Reclaim remaining allocated funds back to owner
    /// Guarantees that testnet funds are never locked permanently!
    pub fn reclaim_budget(&mut self) {
        require!(env::predecessor_account_id() == self.owner_id, "Only owner can reclaim funds");
        let remaining = self.policy.allocated_budget;
        require!(remaining.as_yoctonear() > 0, "No remaining funds to reclaim");

        self.policy.allocated_budget = NearToken::from_yoctonear(0);
        Promise::new(self.owner_id.clone()).transfer(remaining);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"voiceleash\",\"version\":\"1.0.0\",\"event\":\"budget_reclaimed\",\"data\":[{{\"recipient\":\"{}\",\"amount\":\"{}\"}}]}}",
            self.owner_id, remaining.as_yoctonear()
        ));
    }

    pub fn get_policy(&self) -> PolicyRule {
        self.policy.clone()
    }
}
