use anchor_lang::prelude::*;
use state::*;
use instructions::*;

pub mod instructions;
pub mod state;

declare_id!("Bez8zTCqWNFiWorJXE7jvz1XbSqbLLvSb6fRR2p85ZVB");

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
        sub_goals: [SubGoal; 3], 
        total_incentive_amount: u64,
        completion_time: u64, 
        locked_amount: u64,
        unlock_time: u64
    ) -> Result<()> {
        instructions::create::setup_goal(ctx, taker, description, room, relations, eventype, sub_goals, total_incentive_amount, completion_time, locked_amount, unlock_time)
    }
}
