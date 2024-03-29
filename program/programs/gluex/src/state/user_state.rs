use anchor_lang::prelude::*;

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum Roomspace {
    LoveGame = 1,
    GroupGame,
} 

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum Relations {
    Parents = 1,
    Lover,
    Bosstaff,
    Partner,    // include friends
    Dao,        // stranger
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum EventType {
    HabitTraning = 1,
    TargetAchieve,
    SurpriseTime
}

pub struct Action {

}

// #[account]
#[derive(Debug, Default, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub struct SubGoal {
    pub description: [u8; 20], // subgoal description
    pub deadline: u64, // completed deadline
    pub incentive_amount: u64, // incentive amount
    pub completed: bool, // whether is completed
}

impl SubGoal {
    pub fn new(
        description: [u8; 20],  
        deadline: u64, 
        completed: bool, 
        incentive_amount: u64,
    ) -> Self {
        SubGoal{ 
            description,
            deadline,
            completed,
            incentive_amount,
         }
    }
}

#[account]
pub struct TotalGoal {
    pub issuer: Pubkey, // 8 + (32 * 2) + des.len() + 3 + (40 * 3) + (8 * 4) + 1 
    pub taker: Pubkey,
    pub description: String, // total goal description
    pub room: Roomspace,
    pub relations: Relations,
    pub eventype: EventType,
    pub sub_goals: [SubGoal; 3], // subgoal list
    pub total_incentive_amount: u64, // total incentive amout
    pub completion_time: u64, // total goal completed
    pub locked_amount: u64, // lock amout
    pub unlock_time: u64, // unlock time
    pub bump: u8,
}

impl TotalGoal {
    pub fn new(
        issuer: Pubkey,
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
        bump: u8,
    ) -> Self {
        TotalGoal{ 
            issuer,
            taker, 
            description,
            room,
            relations,
            eventype,
            sub_goals, 
            total_incentive_amount,
            completion_time, 
            locked_amount,
            unlock_time,
            bump,
         }
    }
}

// Todo: needs another program to log user infos
// #[account]
// pub struct UserStats {
//     pub owner: Pubkey,
//     pub level: u16,
//     pub name: String,
//     pub count: String,
//     pub bump: u8,
//     pub goal: Vec<TotalGoal> 
// }