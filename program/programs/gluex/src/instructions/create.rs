use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use solana_program::hash::hash;

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
    param_check(
        &ctx,
        &description,
        &eventype,
        &sub_goals,
        total_incentive_amount,
        completion_time,
        locked_amount,
        unlock_time,
        &config,
    )?;

    let now = Clock::get()?.unix_timestamp;
    let (normalized_sub_goals, active_sub_goals, start_time, surprise_ts, checkpoint_interval) =
        prepare_sub_goals(
            &eventype,
            &sub_goals,
            total_incentive_amount,
            completion_time,
            &config,
            now,
        )?;

    let new_goals = &mut ctx.accounts.goals;
    new_goals.issuer = ctx.accounts.payer.key();
    new_goals.taker = taker;
    new_goals.id = goal_id;
    new_goals.description = description;
    new_goals.room = room;
    new_goals.relations = relations;
    new_goals.eventype = eventype;
    new_goals.sub_goals = normalized_sub_goals;
    new_goals.active_sub_goals = active_sub_goals;
    new_goals.total_incentive_amount = total_incentive_amount;
    // calculate fee using global FeePool params if provided
    let mut fee: u64 = 0;
    if let Some(fee_pool_acct) = ctx.accounts.fee_pool.as_ref() {
        // if fee pool exists, read params
        let num = fee_pool_acct.protocol_fee_numerator;
        let den = fee_pool_acct.protocol_fee_denominator;
        if den > 0 && num > 0 {
            let calc = (total_incentive_amount as u128)
                .checked_mul(num as u128)
                .ok_or(GluXError::PayerAccountInsufficient)?
                .checked_div(den as u128)
                .ok_or(GluXError::PayerAccountInsufficient)?;
            fee = calc as u64;
        }
    }

    let deposited = total_incentive_amount.saturating_sub(fee);
    new_goals.deposited_amount = deposited;
    new_goals.released_amount = 0;
    new_goals.completion_time = completion_time;
    new_goals.locked_amount = locked_amount;
    new_goals.unlock_time = unlock_time;
    new_goals.start_time = start_time;
    new_goals.surprise_trigger_ts = surprise_ts;
    new_goals.checkpoint_interval = checkpoint_interval;
    new_goals.completed_count = 0;
    new_goals.failed = false;
    new_goals.bump = ctx.bumps.goals;

    // transfer fee (if any) to fee pool, then deposit remaining to goal account
    if fee > 0 {
        if let Some(fee_pool_acct) = ctx.accounts.fee_pool.as_ref() {
            let transfer_fee_ix = system_instruction::transfer(
                &ctx.accounts.payer.key(),
                &fee_pool_acct.key(),
                fee,
            );
            invoke(
                &transfer_fee_ix,
                &[
                    ctx.accounts.payer.to_account_info(),
                    fee_pool_acct.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
            )?;
        }
    }

    if deposited > 0 {
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.payer.key(),
            &new_goals.key(),
            deposited,
        );
        invoke(
            &transfer_ix,
            &[
                ctx.accounts.payer.to_account_info(),
                new_goals.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
    }

    Ok(())
}

#[derive(Accounts)]
#[instruction(taker: Pubkey, goal_id: i64)]
pub struct SetupGoal<'info> {
    #[account(
        init, payer = payer, space = GOAL_ACCOUNT_SPACE, 
        seeds = [b"gluex-goals", payer.key().as_ref(), taker.as_ref(), goal_id.to_le_bytes().as_ref()], bump
    )]
    pub goals: Account<'info, TotalGoal>,

    #[account(mut)]
    pub payer: Signer<'info>,

    // optional fee pool: if present, fees are collected according to its params
    #[account(mut)]
    pub fee_pool: Option<Account<'info, FeePool>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MigrateTotalGoal<'info> {
    /// The existing goals account (PDA) to overwrite. Must be owned by this program.
    /// CHECK: left as AccountInfo because we write raw bytes into it during migration.
    #[account(mut)]
    pub goals: AccountInfo<'info>,
    #[account(signer)]
    pub initiator: Signer<'info>,
}

pub fn migrate_total_goal(
    ctx: Context<MigrateTotalGoal>,
    issuer: Pubkey,
    taker: Pubkey,
    goal_id: i64,
    bump: u8,
) -> Result<()> {
    let acct_info = &ctx.accounts.goals;

    // Ensure account is owned by this program
    if acct_info.owner != ctx.program_id {
        return err!(GluXError::UnauthorizedSigner);
    }

    // Validate provided bump and seeds derive to the provided account
    let id_bytes = goal_id.to_le_bytes();
    let bump_seed = [bump];
    let expected = Pubkey::create_program_address(
        &[b"gluex-goals", issuer.as_ref(), taker.as_ref(), &id_bytes, &bump_seed],
        ctx.program_id,
    )
    .map_err(|_| error!(GluXError::ParsePubkeyError))?;

    if expected != *acct_info.key {
        return err!(GluXError::ParsePubkeyError);
    }

    // Build a fresh default TotalGoal and write it into the account (preserve lamports)
    let new_goal = TotalGoal {
        issuer,
        taker,
        id: goal_id,
        description: String::new(),
        room: Roomspace::default(),
        relations: Relations::default(),
        eventype: EventType::default(),
        sub_goals: [SubGoal::default(); MAXIUMUN_SUBGOALS],
        active_sub_goals: 0,
        total_incentive_amount: 0,
        deposited_amount: 0,
        released_amount: 0,
        completion_time: 0,
        locked_amount: 0,
        unlock_time: 0,
        start_time: 0,
        surprise_trigger_ts: 0,
        checkpoint_interval: 0,
        completed_count: 0,
        failed: false,
        version: 1,
        bump,
    };

    // Serialize to bytes
    let data = new_goal.try_to_vec().map_err(|_| error!(GluXError::None))?;

    // Prepend Anchor account discriminator (first 8 bytes of sha256("account:TotalGoal"))
    let disc_bytes = hash(b"account:TotalGoal").to_bytes();
    let disc = &disc_bytes[..8];

    // Combined output = discriminator + serialized struct
    let mut out: Vec<u8> = Vec::with_capacity(disc.len() + data.len());
    out.extend_from_slice(disc);
    out.extend_from_slice(&data);

    // Ensure target account has sufficient data length
    let acct_len = acct_info.try_borrow_data()?.len();
    if out.len() > acct_len {
        return err!(GluXError::NoFundsAvailable);
    }

    // Write discriminator+serialized bytes into account data, zero remaining bytes
    let mut acct_data = acct_info.try_borrow_mut_data()?;
    acct_data[..out.len()].copy_from_slice(&out);
    for i in out.len()..acct_len {
        acct_data[i] = 0;
    }

    Ok(())
}

fn prepare_sub_goals(
    eventype: &EventType,
    sub_goals: &[SubGoalInput],
    total_incentive_amount: u64,
    completion_time: i64,
    config: &GoalConfigInput,
    current_time: i64,
) -> Result<([SubGoal; MAXIUMUN_SUBGOALS], u8, i64, i64, i64)> {
    let mut storage = [SubGoal::default(); MAXIUMUN_SUBGOALS];
    let mut surprise_ts: i64 = -1;
    let mut checkpoint_interval = config.checkpoint_interval;
    let mut active: u8 = 0;
    let mut start_time = if config.start_time > 0 {
        config.start_time
    } else {
        current_time
    };

    match eventype {
        EventType::HabitTraning => {
            require!(config.start_time > 0, GluXError::HabitConfigInvalid);
            checkpoint_interval = if config.checkpoint_interval > 0 {
                config.checkpoint_interval
            } else {
                HABIT_INTERVAL_SECONDS
            };
            let checkpoints = habit_amounts(total_incentive_amount);
            for week in 0..HABIT_CHECKPOINTS {
                let title = format!("21d habit checkpoint {}", week + 1);
                let mut goal = SubGoal::from_input(&SubGoalInput {
                    title,
                    deadline: config.start_time + ((week as i64 + 1) * checkpoint_interval),
                    incentive_amount: checkpoints[week],
                    auto_release_at: 0,
                });
                goal.verifier = Pubkey::default();
                storage[week] = goal;
            }
            active = HABIT_CHECKPOINTS as u8;
        }
        EventType::TargetAchieve => {
            require!(!sub_goals.is_empty(), GluXError::MissingSubGoals);
            for (idx, input) in sub_goals.iter().enumerate().take(MAXIUMUN_SUBGOALS) {
                storage[idx] = SubGoal::from_input(input);
                active += 1;
            }
        }
        EventType::SurpriseTime => {
            require!(config.surprise_time > 0, GluXError::HabitConfigInvalid);
            surprise_ts = config.surprise_time;
            start_time = config.surprise_time;
            let mut goal = SubGoal::from_input(&SubGoalInput {
                title: "Surprise Moment".to_string(),
                deadline: config.surprise_time,
                incentive_amount: total_incentive_amount,
                auto_release_at: config.surprise_time,
            });
            goal.is_active = true;
            storage[0] = goal;
            active = 1;
        }
    };

    require!(active > 0, GluXError::MissingSubGoals);
    require!(completion_time >= start_time, GluXError::HabitConfigInvalid);

    Ok((storage, active, start_time, surprise_ts, checkpoint_interval))
}

fn param_check(
    ctx: &Context<SetupGoal>,
    description: &String,
    eventype: &EventType,
    sub_goals: &[SubGoalInput], 
    total_incentive_amount: u64,
    completion_time: i64, 
    locked_amount: u64,
    unlock_time: i64,
    config: &GoalConfigInput,
) -> Result<()> {
    let clock = Clock::get()?.unix_timestamp;
    require!(description.len() <= MAXIUMUN_DESCRIPTIONS_LENS, GluXError::DescExceedMaxChars);
    require!(total_incentive_amount > 0, GluXError::PayerAccountInsufficient);
    require!(total_incentive_amount <= ctx.accounts.payer.lamports(), GluXError::PayerAccountInsufficient);
    require!(locked_amount <= total_incentive_amount, GluXError::LockedAmountInvalid);
    require!(unlock_time >= completion_time, GluXError::UnLockedTimeInvalid);
    require!(completion_time >= clock, GluXError::HabitConfigInvalid);
    require!(config.checkpoint_interval >= 0, GluXError::InvalidCheckpointInterval);

    match eventype {
        EventType::HabitTraning => {
            require!(config.start_time >= clock, GluXError::HabitConfigInvalid);
        }
        EventType::TargetAchieve => {
            require!(!sub_goals.is_empty(), GluXError::MissingSubGoals);
            require!(sub_goals.len() <= MAXIUMUN_SUBGOALS, GluXError::SubGoalNumExceed);
            let sum_sub_goals: u64 = sub_goals.iter().map(|goal| goal.incentive_amount).sum();
            require!(total_incentive_amount >= sum_sub_goals, GluXError::SumOfSubgoalAmountInvalid);
        }
        EventType::SurpriseTime => {
            require!(config.surprise_time > clock, GluXError::HabitConfigInvalid);
        }
    };
    Ok(())
}