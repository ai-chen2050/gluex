use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

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
    new_goals.description = description;
    new_goals.room = room;
    new_goals.relations = relations;
    new_goals.eventype = eventype;
    new_goals.sub_goals = normalized_sub_goals;
    new_goals.active_sub_goals = active_sub_goals;
    new_goals.total_incentive_amount = total_incentive_amount;
    new_goals.deposited_amount = total_incentive_amount;
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

    let transfer_ix = system_instruction::transfer(
        &ctx.accounts.payer.key(),
        &new_goals.key(),
        total_incentive_amount,
    );

    invoke(
        &transfer_ix,
        &[
            ctx.accounts.payer.to_account_info(),
            new_goals.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(taker: Pubkey)]
pub struct SetupGoal<'info> {
    #[account(
        init, payer = payer, space = GOAL_ACCOUNT_SPACE, 
        seeds = [b"gluex-goals", payer.key().as_ref(), taker.as_ref()], bump
    )]
    pub goals: Account<'info, TotalGoal>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
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