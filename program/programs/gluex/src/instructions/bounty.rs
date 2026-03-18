use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
#[instruction(bounty_id: i64, description: String, task_requirements: String, incentive_amount: u64, deadline: i64, max_claims: u16)]
pub struct PublishBounty<'info> {
    #[account(
        init,
        payer = issuer,
        space = 8 + 32 + 8 + 4 + 200 + 4 + 200 + 8 + 8 + 2 + 2 + 1 + 1,
        seeds = [b"open-bounty", issuer.key().as_ref(), bounty_id.to_le_bytes().as_ref()],
        bump
    )]
    pub open_bounty: Account<'info, OpenBounty>,
    #[account(mut)]
    pub issuer: Signer<'info>,
    #[account(mut)]
    pub fee_pool: Option<Account<'info, FeePool>>,
    pub system_program: Program<'info, System>,
}

pub fn publish_bounty(
    ctx: Context<PublishBounty>,
    bounty_id: i64,
    description: String,
    task_requirements: String,
    incentive_amount: u64,
    deadline: i64,
    max_claims: u16,
) -> Result<()> {
    let bounty = &mut ctx.accounts.open_bounty;
    bounty.issuer = ctx.accounts.issuer.key();
    bounty.bounty_id = bounty_id;
    bounty.description = description;
    bounty.task_requirements = task_requirements;
    bounty.incentive_amount = incentive_amount;
    bounty.deadline = deadline;
    bounty.max_claims = max_claims;
    bounty.current_claims = 0;
    bounty.is_active = true;
    bounty.bump = ctx.bumps.open_bounty;

    // calculate fee using global FeePool params if provided
    let mut fee: u64 = 0;
    if let Some(fee_pool_acct) = ctx.accounts.fee_pool.as_ref() {
        let num = fee_pool_acct.protocol_fee_numerator;
        let den = fee_pool_acct.protocol_fee_denominator;
        if den > 0 && num > 0 {
            let calc = (incentive_amount as u128)
                .checked_mul(num as u128)
                .ok_or(GluXError::PayerAccountInsufficient)?
                .checked_div(den as u128)
                .ok_or(GluXError::PayerAccountInsufficient)?;
            fee = calc as u64;
        }
    }

    let deposited = incentive_amount.saturating_sub(fee);

    // transfer fee (if any) to fee pool, then deposit remaining to bounty PDA
    if fee > 0 {
        if let Some(fee_pool_acct) = ctx.accounts.fee_pool.as_ref() {
            let fee_ctx = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.issuer.to_account_info(),
                    to: fee_pool_acct.to_account_info(),
                },
            );
            system_program::transfer(fee_ctx, fee)?;
        }
    }

    if deposited > 0 {
        let dep_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.issuer.to_account_info(),
                to: bounty.to_account_info(),
            },
        );
        system_program::transfer(dep_ctx, deposited)?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimBounty<'info> {
    #[account(
        mut,
        seeds = [b"open-bounty", open_bounty.issuer.as_ref(), open_bounty.bounty_id.to_le_bytes().as_ref()],
        bump = open_bounty.bump
    )]
    pub open_bounty: Account<'info, OpenBounty>,
    #[account(
        init,
        payer = taker,
        space = 8 + 32 + 32 + 8 + 1 + 1 + 200 + 1,
        seeds = [b"bounty-exec", open_bounty.key().as_ref(), taker.key().as_ref()],
        bump
    )]
    pub bounty_execution: Account<'info, BountyExecution>,
    #[account(mut)]
    pub taker: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn claim_bounty(ctx: Context<ClaimBounty>) -> Result<()> {
    let bounty = &mut ctx.accounts.open_bounty;
    require!(bounty.is_active, GluXError::BountyNotActive);
    require!(
        bounty.current_claims < bounty.max_claims,
        GluXError::MaxClaimsReached
    );

    bounty.current_claims = bounty.current_claims.saturating_add(1);

    let execution = &mut ctx.accounts.bounty_execution;
    execution.bounty_pda = bounty.key();
    execution.taker = ctx.accounts.taker.key();
    execution.assigned_at = Clock::get()?.unix_timestamp;
    execution.is_approved = false;
    execution.is_rejected = false;
    execution.proof_uri = String::new();
    execution.bump = ctx.bumps.bounty_execution;

    Ok(())
}

#[derive(Accounts)]
pub struct VerifyAndRewardBounty<'info> {
    #[account(
        mut,
        seeds = [b"open-bounty", issuer.key().as_ref(), open_bounty.bounty_id.to_le_bytes().as_ref()],
        bump = open_bounty.bump
    )]
    pub open_bounty: Account<'info, OpenBounty>,
    #[account(
        mut,
        seeds = [b"bounty-exec", open_bounty.key().as_ref(), taker_account.key().as_ref()],
        bump = bounty_execution.bump
    )]
    pub bounty_execution: Account<'info, BountyExecution>,
    #[account(mut)]
    pub issuer: Signer<'info>,
    /// CHECK: taker to receive funds
    #[account(mut)]
    pub taker_account: AccountInfo<'info>,
    #[account(mut)]
    pub taker_profile: Option<Account<'info, AgentProfile>>,
    #[account(mut)]
    pub referrer_profile: Option<Account<'info, AgentProfile>>,
}

pub fn verify_and_reward_bounty(
    ctx: Context<VerifyAndRewardBounty>,
    is_approved: bool,
) -> Result<()> {
    let execution = &mut ctx.accounts.bounty_execution;
    require!(!execution.is_approved && !execution.is_rejected, GluXError::BountyAlreadyFinalized);

    if !is_approved {
        execution.is_rejected = true;
        return Ok(());
    }

    execution.is_approved = true;
    let amount = ctx.accounts.open_bounty.incentive_amount;

    // Payout logic
    let bounty_account_info = ctx.accounts.open_bounty.to_account_info();
    let destination = ctx.accounts.taker_account.to_account_info();

    **bounty_account_info.try_borrow_mut_lamports()? = bounty_account_info
        .lamports()
        .checked_sub(amount)
        .ok_or(GluXError::NoFundsAvailable)?;

    **destination.try_borrow_mut_lamports()? = destination
        .lamports()
        .checked_add(amount)
        .ok_or(GluXError::NoFundsAvailable)?;

    // Gamification Points
    if let Some(profile) = ctx.accounts.taker_profile.as_mut() {
        profile.reputation_score = profile.reputation_score.saturating_add(100);
        profile.tasks_completed = profile.tasks_completed.saturating_add(1);
    }
    
    if let Some(referrer) = ctx.accounts.referrer_profile.as_mut() {
        // Referral bonus
        referrer.reputation_score = referrer.reputation_score.saturating_add(10);
    }

    Ok(())
}
