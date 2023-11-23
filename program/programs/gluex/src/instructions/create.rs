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