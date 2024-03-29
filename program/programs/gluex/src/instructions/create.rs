use crate::state::*;
use anchor_lang::prelude::*;

pub fn setup_goal(
    ctx: Context<SetupGoal>,
    taker: Pubkey,
    description: String,
    room: Roomspace,
    relations: Relations,
    eventype: EventType,
    sub_goals: [SubGoal; 3], 
    total_incentive_amount: u64,
    completion_time: u64, 
    locked_amount: u64,
    unlock_time: u64,
) -> Result<()> {
    let pass = param_check(
        &ctx,
        &description,
        &room,
        &relations,
        &eventype,
        sub_goals, 
        total_incentive_amount,
        completion_time, 
        locked_amount,
        unlock_time,
    );
    
    if let Err(err) = pass {
        msg!("An error occurred: {:?}", err);
        return Err(err);
    } 
    
    let new_goals = &mut ctx.accounts.goals;
    new_goals.issuer = ctx.accounts.payer.key();
    new_goals.taker = taker;
    new_goals.description = description;
    new_goals.room = room;
    new_goals.relations = relations;
    new_goals.eventype = eventype;
    new_goals.sub_goals = sub_goals;
    new_goals.total_incentive_amount = total_incentive_amount;
    new_goals.completion_time = completion_time;
    new_goals.locked_amount = locked_amount;
    new_goals.unlock_time = unlock_time;
    new_goals.bump = *ctx.bumps.get("gluex-goals").unwrap();  
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(taker: String, description: String)]
pub struct SetupGoal<'info> {
    #[account(
        init, payer = payer, space = 8 + (32 * 2) + description.len() + (1 * 3) + (3 * (20+ 8 * 2 + 4)) + (8 * 4) + 1, 
        seeds = [b"gluex-goals", payer.key().as_ref(), taker.as_bytes()], bump
    )]
    pub goals: Account<'info, TotalGoal>,

    #[account(mut)]
    payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/*
    1、parameter check
    description: fixed maxiumum char
    room/relations/eventype: in types
    sub_goals: fixed number
    total_incentive_amount < account amount
    total_incentive_amount >= locked_amount
    total_incentive_amount >= sum of all subgoals
    unlock_time > completion_time
*/ 
fn param_check(
    ctx: &Context<SetupGoal>,
    description: &String,
    room: &Roomspace,
    relations: &Relations,
    eventype: &EventType,
    sub_goals: [SubGoal; 3], 
    total_incentive_amount: u64,
    completion_time: u64, 
    locked_amount: u64,
    unlock_time: u64,
) -> Result<()> {
    // description length check
    require!(description.len() < MAXIUMUN_DESCRIPTIONS_LENS, GluXError::DescExceedMaxChars);

    // Check if room, relations, and eventype are valid types
    // (Implement the appropriate checks for each type)
    match room {
        Roomspace::LoveGame => msg!("Room: LoveGame"),
        Roomspace::GroupGame => msg!("Room: GroupGame"),
        _ => return err!(GluXError::RoomNotSupport),
    };

    match relations {
        Relations::Parents => msg!("Relations: Parents"),
        Relations::Lover => msg!("Relations: Lover"),
        Relations::Bosstaff => msg!("Relations: Bosstaff"),
        Relations::Partner => msg!("Relations: Partner"),
        Relations::Dao => msg!("Relations: Dao"),
        _ => return err!(GluXError::RelationsNotSupport),
    };

    match eventype {
        EventType::HabitTraning => msg!("Event: HabitTraning"),
        EventType::TargetAchieve => msg!("Event: TargetAchieve"),
        EventType::SurpriseTime => msg!("Event: SurpriseTime"),
        _ => return err!(GluXError::EventTypeNotSupport),
    };

    // Check if sub_goals has a fixed number
    require!(sub_goals.len() < MAXIUMUN_SUBGOALS, GluXError::SubGoalNumExceed);
    
    // Check if total_incentive_amount is smaller than account amount
    // (Implement the appropriate check)
    require!(total_incentive_amount < ctx.accounts.payer.lamports(), GluXError::PayerAccountInsufficient);
    require!(total_incentive_amount >= locked_amount, GluXError::PayerAccountInsufficient);
    
    // Check if total_incentive_amount is greater than the sum of all subgoals
    let sum_sub_goals: u64 = sub_goals.iter().map(|goal| goal.incentive_amount).sum();
    require!(total_incentive_amount >= sum_sub_goals, GluXError::SumOfSubgoalAmountInvalid);
    
    // Check if unlock_time is greater than completion_time
    require!(unlock_time >= completion_time, GluXError::SumOfSubgoalAmountInvalid);
    Ok(())
}