use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct AgentProfile {
    pub owner: Pubkey,
    pub reputation_score: u64,
    pub tasks_completed: u32,
    pub invited_by: Pubkey, // default if none
    pub joined_at: i64,
    pub bump: u8,
}

#[account]
#[derive(Default, Debug)]
pub struct SocialConnection {
    pub user_a: Pubkey,
    pub user_b: Pubkey,
    pub interaction_count: u64,
    pub bump: u8,
}
