use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct OpenBounty {
    pub issuer: Pubkey,
    pub bounty_id: i64,
    pub description: String, 
    pub task_requirements: String,
    pub incentive_amount: u64,
    pub deadline: i64,
    pub max_claims: u16,
    pub current_claims: u16,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(Default, Debug)]
pub struct BountyExecution {
    pub bounty_pda: Pubkey,
    pub taker: Pubkey,
    pub assigned_at: i64,
    pub is_approved: bool,
    pub is_rejected: bool,
    pub proof_uri: String,
    pub bump: u8,
}
