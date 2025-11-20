use crate::state::*;
use anchor_lang::prelude::*;
use super::constraints::{HABIT_CHECKPOINTS, HABIT_INTERVAL_SECONDS, MAXIUMUN_SUBGOALS};

impl SubGoal {
    pub fn from_input(input: &SubGoalInput) -> Self {
        let mut goal = SubGoal::default();
        goal.title = string_to_fixed(&input.title);
        goal.deadline = input.deadline;
        goal.incentive_amount = input.incentive_amount;
        goal.auto_release_at = if input.auto_release_at > 0 {
            input.auto_release_at
        } else {
            input.deadline
        };
        goal.is_active = true;
        goal
    }
}

pub fn blank_sub_goals() -> [SubGoal; MAXIUMUN_SUBGOALS] {
    [SubGoal::default(); MAXIUMUN_SUBGOALS]
}

pub fn habit_amounts(total: u64) -> [u64; HABIT_CHECKPOINTS] {
    let multipliers: [u64; HABIT_CHECKPOINTS] = [1, 2, 4];
    let mut amounts = [0u64; HABIT_CHECKPOINTS];
    let denominator: u64 = multipliers.iter().sum();
    let mut distributed: u64 = 0;
    for (idx, ratio) in multipliers.iter().enumerate() {
        let mut portion = total
            .checked_mul(*ratio)
            .unwrap_or(0)
            / denominator.max(1);
        if idx == HABIT_CHECKPOINTS - 1 {
            portion = total.saturating_sub(distributed);
        } else {
            distributed = distributed.saturating_add(portion);
        }
        amounts[idx] = portion;
    }
    amounts
}

pub fn default_checkpoint_interval(input: i64) -> i64 {
    if input > 0 {
        input
    } else {
        HABIT_INTERVAL_SECONDS
    }
}
