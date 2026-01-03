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
        goal_id: i64,
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
            goal_id,
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

    pub fn create_fee_pool(ctx: Context<CreateFeePool>, founder: Pubkey) -> Result<()> {
        instructions::fee::create_fee_pool(ctx, founder)
    }

    pub fn add_donation(
        ctx: Context<AddDonation>,
        amount: u64,
        currency: String,
        txhash: String,
    ) -> Result<()> {
        instructions::fee::add_donation(ctx, amount, currency, txhash)
    }

    pub fn add_maintainer(ctx: Context<AddMaintainer>, maintainer: Pubkey) -> Result<()> {
        instructions::fee::add_maintainer(ctx, maintainer)
    }

    pub fn distribute_fees(ctx: Context<DistributeFees>) -> Result<()> {
        instructions::fee::distribute_fees(ctx)
    }

    pub fn set_fee_params(
        ctx: Context<SetFeeParams>,
        numerator: u64,
        denominator: u64,
    ) -> Result<()> {
        instructions::fee::set_fee_params(ctx, numerator, denominator)
    }

    pub fn migrate_fee_pool(ctx: Context<MigrateFeePool>, bump: u8) -> Result<()> {
        instructions::fee::migrate_fee_pool(ctx, bump)
    }

    pub fn migrate_total_goal(
        ctx: Context<MigrateTotalGoal>,
        issuer: Pubkey,
        taker: Pubkey,
        goal_id: i64,
        bump: u8,
    ) -> Result<()> {
        instructions::create::migrate_total_goal(ctx, issuer, taker, goal_id, bump)
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
