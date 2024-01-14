use borsh::{BorshDeserialize, BorshSerialize};
use anchor_lang::prelude::*;

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub enum Roomspace {
    LoveGame = 1,
    GroupGame,
} 

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub enum Relations {
    Parents = 1,
    Lover,
    Bosstaff,
    Partner,    // include friends
    Dao,        // stranger
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize)]
pub enum EventType {
    HabitTraning = 1,
    TargetAchieve,
    SurpriseTime
}

pub struct Action {

}

#[account]
pub struct SubGoal {
    pub description: String, // subgoal description
    pub deadline: u64, // completed deadline
    pub completed: bool, // whether is completed
    pub incentive_amount: u64, // incentive amount
}

impl SubGoal {
    pub fn new(
        description: String,  
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
    pub owner: Pubkey,
    pub description: String, // total goal description
    pub room: Roomspace,
    pub relations: Relations,
    pub eventype: EventType,
    pub sub_goals: Vec<SubGoal>, // subgoal list
    pub total_incentive_amount: u64, // total incentive amout
    pub completion_time: u64, // total goal completed
    pub locked_amount: u64, // lock amout
    pub unlock_time: u64, // unlock time
}

impl TotalGoal {
    pub fn new(
        owner: Pubkey,
        description: String,
        room: Roomspace,
        relations: Relations,
        eventype: EventType,
        sub_goals: Vec<SubGoal>, 
        total_incentive_amount: u64,
        completion_time: u64, 
        locked_amount: u64,
        unlock_time: u64,
    ) -> Self {
        TotalGoal{ 
            owner, 
            description,
            room,
            relations,
            eventype,
            sub_goals, 
            total_incentive_amount,
            completion_time, 
            locked_amount,
            unlock_time,
         }
    }
}

// Todo: needs another program to log user infos
#[account]
pub struct UserStats {
    pub owner: Pubkey,
    pub level: u16,
    pub name: String,
    pub count: String,
    pub bump: u8,
    // pub goal: Vec<TotalGoal> 
}