use crate::state::*;
use anchor_lang::prelude::*;

pub fn create_fee_pool(ctx: Context<CreateFeePool>, founder: Pubkey) -> Result<()> {
    let pool = &mut ctx.accounts.fee_pool;
    pool.founder = founder;
    pool.maintainers = Vec::new();
    // default protocol fee: 1/1000
    pool.protocol_fee_numerator = 1;
    pool.protocol_fee_denominator = 1000;
    pool.bump = ctx.bumps.fee_pool;
    Ok(())
}

pub fn add_maintainer(ctx: Context<AddMaintainer>, maintainer: Pubkey) -> Result<()> {
    let pool = &mut ctx.accounts.fee_pool;
    require_keys_eq!(pool.founder, ctx.accounts.founder.key(), GluXError::UnauthorizedSigner);
    require!(pool.maintainers.len() < MAX_MAINTAINERS, GluXError::MaxMaintainersReached);

    if !pool.maintainers.iter().any(|k| k == &maintainer) {
        pool.maintainers.push(maintainer);
    }
    Ok(())
}

pub fn distribute_fees(ctx: Context<DistributeFees>) -> Result<()> {
    let pool = &mut ctx.accounts.fee_pool;
    let pool_acct = pool.to_account_info();
    let total = pool_acct.lamports();
    require!(total > 0, GluXError::NoFundsAvailable);

    let n = pool.maintainers.len();

    if n == 0 {
        // solo: everything to founder
        let founder_dest = &ctx.accounts.founder_dest;
        **pool_acct.try_borrow_mut_lamports()? = pool_acct
            .lamports()
            .checked_sub(total)
            .ok_or(GluXError::NoFundsAvailable)?;
        **founder_dest.try_borrow_mut_lamports()? = founder_dest
            .lamports()
            .checked_add(total)
            .ok_or(GluXError::NoFundsAvailable)?;
        return Ok(());
    }

    if n == 1 {
        let founder_share = total / 2;
        let maint_share = total - founder_share;

        let founder_dest = &ctx.accounts.founder_dest;
        let maint_dest = &ctx.remaining_accounts[0];

        **pool_acct.try_borrow_mut_lamports()? = pool_acct
            .lamports()
            .checked_sub(total)
            .ok_or(GluXError::NoFundsAvailable)?;

        **founder_dest.try_borrow_mut_lamports()? = founder_dest
            .lamports()
            .checked_add(founder_share)
            .ok_or(GluXError::NoFundsAvailable)?;

        **maint_dest.try_borrow_mut_lamports()? = maint_dest
            .lamports()
            .checked_add(maint_share)
            .ok_or(GluXError::NoFundsAvailable)?;

        return Ok(());
    }

    // n >= 2: founder 50%, remaining 50% split equally among maintainers
    let founder_share = total / 2;
    let contributor_pool = total - founder_share;
    let per = contributor_pool / (n as u64);
    // remainder goes to founder
    let distributed = founder_share + per * (n as u64);
    let remainder = total.saturating_sub(distributed);

    // apply transfers
    **pool_acct.try_borrow_mut_lamports()? = pool_acct
        .lamports()
        .checked_sub(total)
        .ok_or(GluXError::NoFundsAvailable)?;

    // founder dest
    **ctx.accounts.founder_dest.try_borrow_mut_lamports()? = ctx.accounts.founder_dest
        .lamports()
        .checked_add(founder_share + remainder)
        .ok_or(GluXError::NoFundsAvailable)?;

    // maintainers
    for (i, _pk) in pool.maintainers.iter().enumerate() {
        let dest = &ctx.remaining_accounts[i];
        **dest.try_borrow_mut_lamports()? = dest
            .lamports()
            .checked_add(per)
            .ok_or(GluXError::NoFundsAvailable)?;
    }

    Ok(())
}

pub fn set_fee_params(ctx: Context<SetFeeParams>, numerator: u64, denominator: u64) -> Result<()> {
    let pool = &mut ctx.accounts.fee_pool;
    require_keys_eq!(pool.founder, ctx.accounts.founder.key(), GluXError::UnauthorizedSigner);
    require!(denominator > 0, GluXError::HabitConfigInvalid);
    pool.protocol_fee_numerator = numerator;
    pool.protocol_fee_denominator = denominator;
    Ok(())
}

#[derive(Accounts)]
#[instruction(founder: Pubkey)]
pub struct CreateFeePool<'info> {
    #[account(init, payer = payer, space = FEE_POOL_SPACE, seeds = [b"gluex-fee-pool"], bump)]
    pub fee_pool: Account<'info, FeePool>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddMaintainer<'info> {
    #[account(mut, seeds = [b"gluex-fee-pool"], bump = fee_pool.bump)]
    pub fee_pool: Account<'info, FeePool>,
    pub founder: Signer<'info>,
}

#[derive(Accounts)]
pub struct DistributeFees<'info> {
    #[account(mut, seeds = [b"gluex-fee-pool"], bump = fee_pool.bump)]
    pub fee_pool: Account<'info, FeePool>,
    /// CHECK: destination for founder
    #[account(mut)]
    pub founder_dest: AccountInfo<'info>,
    // maintainers destinations are passed as remaining_accounts in the same order
}

#[derive(Accounts)]
pub struct SetFeeParams<'info> {
    #[account(mut, seeds = [b"gluex-fee-pool"], bump = fee_pool.bump)]
    pub fee_pool: Account<'info, FeePool>,
    pub founder: Signer<'info>,
}
