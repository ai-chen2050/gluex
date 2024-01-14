use anchor_lang::prelude::{*};
use crate::state::*;

pub fn initialise(
    ctx: Context<Initialise>,
    description: String,
    room: Roomspace,
    relations: Relations,
    eventype: EventType,
    sub_goals: Vec<SubGoal>, 
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
        &sub_goals, 
        total_incentive_amount,
        completion_time, 
        locked_amount,
        unlock_time,
    );

    if let Err(err) = pass {
        msg!("An error occurred: {:?}", err);
        return Err(err);
    }

    let one_goal = TotalGoal::new(
        ctx.accounts.payer.key(),
        description,
        room,
        relations,
        eventype,
        sub_goals, 
        total_incentive_amount,
        completion_time, 
        locked_amount,
        unlock_time,
    );  

    Ok(())
}

#[derive(Accounts)]
pub struct Initialise<'info> {
    #[account(mut)]
    address_info: Account<'info, TotalGoal>,

    #[account(mut)]
    payer: Signer<'info>,
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
    ctx: &Context<Initialise>,
    description: &String,
    room: &Roomspace,
    relations: &Relations,
    eventype: &EventType,
    sub_goals: &Vec<SubGoal>, 
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