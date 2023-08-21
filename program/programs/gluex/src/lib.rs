use anchor_lang::prelude::*;

declare_id!("DzZByscRszKLgwFTVM6BMtbG8aBYXfWTbSU7sa9gj5a8");


#[program]
pub mod gluex {

    use super::*;

    pub enum Roomspace {
        LoveGame,
        GroupGame,
    } 

    pub enum Relations {
        Parents,
        Lover,
        Bosstaff,
        Partner,    // include friends
        Dao,        // stranger
    }
    
    pub enum EventType {
        HabitTraning,
        TargetAchieve,
        SurpriseTime
    }

    pub struct Action {

    }



    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
