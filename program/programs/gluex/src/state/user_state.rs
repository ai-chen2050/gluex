use super::constraints::{
    MAXIUMUN_SUBGOALS, MAX_DESCRIPTION_BYTES, MAX_PROOF_URI_LENGTH, MAX_SUBGOAL_TITLE_LENGTH,
};
use anchor_lang::prelude::*;

#[derive(Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq, Eq)]
pub enum Roomspace {
    LoveGame = 1,
    GroupGame,
}

impl Default for Roomspace {
    fn default() -> Self {
        Roomspace::LoveGame
    }
}

#[derive(Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq, Eq)]
pub enum Relations {
    Parents = 1,
    Lover,
    Bosstaff,
    Partner, // include friends
    Dao,     // stranger
}

impl Default for Relations {
    fn default() -> Self {
        Relations::Parents
    }
}

#[derive(Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq, Eq)]
pub enum EventType {
    HabitTraning = 1,
    TargetAchieve,
    SurpriseTime,
}

impl Default for EventType {
    fn default() -> Self {
        EventType::HabitTraning
    }
}

#[derive(Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq, Eq)]
pub enum SubGoalStatus {
    Pending = 1,
    ProofSubmitted,
    Approved,
    Rejected,
    Paid,
}

impl Default for SubGoalStatus {
    fn default() -> Self {
        SubGoalStatus::Pending
    }
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct SubGoalInput {
    pub title: String,
    pub deadline: i64,
    pub incentive_amount: u64,
    pub auto_release_at: i64,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct GoalConfigInput {
    pub start_time: i64,
    pub surprise_time: i64,
    pub checkpoint_interval: i64,
}

#[derive(Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub struct SubGoal {
    pub title: [u8; MAX_SUBGOAL_TITLE_LENGTH], // subgoal description
    pub deadline: i64,                         // completed deadline
    pub incentive_amount: u64,                 // incentive amount
    pub status: SubGoalStatus,                 // lifecycle status
    pub proof_uri: [u8; MAX_PROOF_URI_LENGTH],
    pub submitted_at: i64,
    pub verifier: Pubkey,
    pub auto_release_at: i64,
    pub is_active: bool,
}

impl Default for SubGoal {
    fn default() -> Self {
        SubGoal {
            title: [0; MAX_SUBGOAL_TITLE_LENGTH],
            deadline: 0,
            incentive_amount: 0,
            status: SubGoalStatus::Pending,
            proof_uri: [0; MAX_PROOF_URI_LENGTH],
            submitted_at: 0,
            verifier: Pubkey::default(),
            auto_release_at: 0,
            is_active: false,
        }
    }
}

impl SubGoal {
    pub fn from_title(title: [u8; MAX_SUBGOAL_TITLE_LENGTH]) -> Self {
        SubGoal {
            title,
            ..Default::default()
        }
    }
}

#[account]
#[derive(Default, Debug)]
pub struct TotalGoal {
    pub issuer: Pubkey, // 8 + (32 * 2) + des.len() + 3 + (40 * 3) + (8 * 4) + 1
    pub taker: Pubkey,
    pub description: String, // capped via MAX_DESCRIPTION_BYTES
    pub room: Roomspace,
    pub relations: Relations,
    pub eventype: EventType,
    pub sub_goals: [SubGoal; MAXIUMUN_SUBGOALS], // subgoal list
    pub active_sub_goals: u8,
    pub total_incentive_amount: u64, // total incentive amount
    pub deposited_amount: u64,
    pub released_amount: u64,
    pub completion_time: i64, // total goal completed
    pub locked_amount: u64,   // lock amount
    pub unlock_time: i64,     // unlock time
    pub start_time: i64,
    pub surprise_trigger_ts: i64,
    pub checkpoint_interval: i64,
    pub completed_count: u8,
    pub failed: bool,
    pub bump: u8,
}

impl TotalGoal {
    pub fn description_capacity() -> usize {
        MAX_DESCRIPTION_BYTES
    }

    pub fn goal_seeds(&self) -> [&[u8]; 3] {
        [b"gluex-goals", self.issuer.as_ref(), self.taker.as_ref()]
    }
}

pub fn string_to_fixed<const N: usize>(value: &str) -> [u8; N] {
    let mut buffer = [0u8; N];
    let bytes = value.as_bytes();
    let len = bytes.len().min(N);
    buffer[..len].copy_from_slice(&bytes[..len]);
    buffer
}

pub fn trim_fixed_string(bytes: &[u8]) -> String {
    let len = bytes.iter().position(|b| *b == 0).unwrap_or(bytes.len());
    String::from_utf8_lossy(&bytes[..len]).to_string()
}

// Todo: needs another program to log user infos
// #[account]
// pub struct UserStats {
//     pub owner: Pubkey,
//     pub level: u16,
//     pub name: String,
//     pub count: String,
//     pub bump: u8,
//     pub goal: Vec<TotalGoal>
// }
