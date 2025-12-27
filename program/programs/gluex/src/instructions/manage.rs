use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

pub fn submit_proof(ctx: Context<SubmitProof>, subgoal_index: u8, proof_uri: String) -> Result<()> {
    let goals = &mut ctx.accounts.goals;
    require_keys_eq!(
        goals.taker,
        ctx.accounts.taker.key(),
        GluXError::UnauthorizedTaker
    );
    let index = subgoal_index as usize;
    require!(
        index < goals.active_sub_goals as usize,
        GluXError::SubGoalIndexOutOfBounds
    );

    let goal = &mut goals.sub_goals[index];
    require!(goal.is_active, GluXError::SubGoalIndexOutOfBounds);

    match goal.status {
        SubGoalStatus::Pending | SubGoalStatus::Rejected => {}
        SubGoalStatus::ProofSubmitted => return err!(GluXError::ProofAlreadySubmitted),
        SubGoalStatus::Approved | SubGoalStatus::Paid => {
            return err!(GluXError::SubGoalAlreadyFinalized)
        }
    };

    goal.proof_uri = string_to_fixed(&proof_uri);
    goal.status = SubGoalStatus::ProofSubmitted;
    goal.submitted_at = Clock::get()?.unix_timestamp;
    Ok(())
}

pub fn review_subgoal(ctx: Context<ReviewSubGoal>, subgoal_index: u8, approve: bool) -> Result<()> {
    let goals = &mut ctx.accounts.goals;
    require_keys_eq!(
        goals.issuer,
        ctx.accounts.issuer.key(),
        GluXError::UnauthorizedSigner
    );
    require_keys_eq!(
        goals.taker,
        ctx.accounts.taker_account.key(),
        GluXError::UnauthorizedTaker
    );

    let index = subgoal_index as usize;
    require!(
        index < goals.active_sub_goals as usize,
        GluXError::SubGoalIndexOutOfBounds
    );

    let incentive_amount = {
        let goal = &mut goals.sub_goals[index];
        require!(goal.is_active, GluXError::SubGoalIndexOutOfBounds);

        if !approve {
            goal.status = SubGoalStatus::Rejected;
            return Ok(());
        }

        require!(
            matches!(
                goal.status,
                SubGoalStatus::ProofSubmitted | SubGoalStatus::Pending
            ),
            GluXError::ProofMissing
        );

        goal.status = SubGoalStatus::Approved;
        goal.incentive_amount
    };

    payout_to_taker(
        goals,
        ctx.accounts.taker_account.to_account_info(),
        incentive_amount,
    )?;

    goals.sub_goals[index].status = SubGoalStatus::Paid;
    goals.released_amount = goals.released_amount.saturating_add(incentive_amount);
    goals.completed_count = goals.completed_count.saturating_add(1);
    Ok(())
}

pub fn trigger_surprise(ctx: Context<TriggerSurprise>) -> Result<()> {
    let goals = &mut ctx.accounts.goals;
    require_keys_eq!(
        goals.taker,
        ctx.accounts.taker_account.key(),
        GluXError::UnauthorizedTaker
    );
    let now = Clock::get()?.unix_timestamp;
    require!(
        matches!(goals.eventype, EventType::SurpriseTime),
        GluXError::EventTypeNotSupport
    );
    require!(
        now >= goals.surprise_trigger_ts,
        GluXError::SurpriseTimeNotReached
    );

    let incentive_amount = {
        let goal = &mut goals.sub_goals[0];
        require!(goal.is_active, GluXError::SubGoalIndexOutOfBounds);
        if matches!(goal.status, SubGoalStatus::Paid) {
            return err!(GluXError::SubGoalAlreadyFinalized);
        }
        goal.incentive_amount
    };

    payout_to_taker(
        goals,
        ctx.accounts.taker_account.to_account_info(),
        incentive_amount,
    )?;

    goals.sub_goals[0].status = SubGoalStatus::Paid;
    goals.released_amount = goals.released_amount.saturating_add(incentive_amount);
    goals.completed_count = goals.completed_count.saturating_add(1);
    Ok(())
}

pub fn claim_unused(ctx: Context<ClaimUnused>) -> Result<()> {
    let goals = &mut ctx.accounts.goals;
    require_keys_eq!(
        goals.issuer,
        ctx.accounts.issuer.key(),
        GluXError::UnauthorizedSigner
    );
    let now = Clock::get()?.unix_timestamp;
    require!(now >= goals.unlock_time, GluXError::UnlockTimeNotReached);

    let remaining = goals.deposited_amount.saturating_sub(goals.released_amount);
    require!(remaining > 0, GluXError::NoFundsAvailable);

    payout_from_goal(goals, ctx.accounts.issuer.to_account_info(), remaining)?;

    goals.released_amount = goals.released_amount.saturating_add(remaining);
    Ok(())
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(
        mut,
        seeds = [b"gluex-goals", goals.issuer.as_ref(), goals.taker.as_ref(), goals.id.to_le_bytes().as_ref()],
        bump = goals.bump
    )]
    pub goals: Account<'info, TotalGoal>,
    pub taker: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReviewSubGoal<'info> {
    #[account(
        mut,
        seeds = [b"gluex-goals", goals.issuer.as_ref(), goals.taker.as_ref(), goals.id.to_le_bytes().as_ref()],
        bump = goals.bump
    )]
    pub goals: Account<'info, TotalGoal>,
    pub issuer: Signer<'info>,
    /// CHECK: destination validated via key comparison
    #[account(mut)]
    pub taker_account: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TriggerSurprise<'info> {
    #[account(
        mut,
        seeds = [b"gluex-goals", goals.issuer.as_ref(), goals.taker.as_ref(), goals.id.to_le_bytes().as_ref()],
        bump = goals.bump
    )]
    pub goals: Account<'info, TotalGoal>,
    /// CHECK: validated against stored taker key
    #[account(mut)]
    pub taker_account: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimUnused<'info> {
    #[account(
        mut,
        seeds = [b"gluex-goals", goals.issuer.as_ref(), goals.taker.as_ref(), goals.id.to_le_bytes().as_ref()],
        bump = goals.bump
    )]
    pub goals: Account<'info, TotalGoal>,
    #[account(mut)]
    pub issuer: Signer<'info>,
}

fn payout_to_taker(
    goals: &mut Account<TotalGoal>,
    taker_account: AccountInfo,
    amount: u64,
) -> Result<()> {
    payout_from_goal(goals, taker_account, amount)
}

fn payout_from_goal(
    goals: &mut Account<TotalGoal>,
    destination: AccountInfo,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, GluXError::NoFundsAvailable);
    let goal_account_info = goals.to_account_info();

    **goal_account_info.try_borrow_mut_lamports()? = goal_account_info
        .lamports()
        .checked_sub(amount)
        .ok_or(GluXError::NoFundsAvailable)?;

    **destination.try_borrow_mut_lamports()? = destination
        .lamports()
        .checked_add(amount)
        .ok_or(GluXError::NoFundsAvailable)?;

    Ok(())
}
