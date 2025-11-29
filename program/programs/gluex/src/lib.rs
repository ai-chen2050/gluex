use anchor_lang::prelude::*;
use instructions::*;
use state::*;

pub mod instructions;
pub mod state;

declare_id!("6ExBjE2VPbP8YZhWoXuBgSac5MHS3J8dfviUFuUeBqZe");

#[program]
pub mod gluex {

    use super::*;

    pub fn setup_goal(
        ctx: Context<SetupGoal>,
        taker: Pubkey,
        description: String,
        room: Roomspace,
        relations: Relations,
        eventype: EventType,
        sub_goals: Vec<SubGoalInput>,
        total_incentive_amount: u64,
        completion_time: i64,
        locked_amount: u64,
        unlock_time: i64,
        config: GoalConfigInput,
    ) -> Result<()> {
        instructions::create::setup_goal(
            ctx,
            taker,
            description,
            room,
            relations,
            eventype,
            sub_goals,
            total_incentive_amount,
            completion_time,
            locked_amount,
            unlock_time,
            config,
        )
    }

    pub fn submit_proof(
        ctx: Context<SubmitProof>,
        subgoal_index: u8,
        proof_uri: String,
    ) -> Result<()> {
        instructions::manage::submit_proof(ctx, subgoal_index, proof_uri)
    }

    pub fn review_subgoal(
        ctx: Context<ReviewSubGoal>,
        subgoal_index: u8,
        approve: bool,
    ) -> Result<()> {
        instructions::manage::review_subgoal(ctx, subgoal_index, approve)
    }

    pub fn trigger_surprise(ctx: Context<TriggerSurprise>) -> Result<()> {
        instructions::manage::trigger_surprise(ctx)
    }

    pub fn claim_unused(ctx: Context<ClaimUnused>) -> Result<()> {
        instructions::manage::claim_unused(ctx)
    }
}
