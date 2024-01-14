use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

declare_id!("DzZByscRszKLgwFTVM6BMtbG8aBYXfWTbSU7sa9gj5a8");

#[program]
pub mod gluex {

    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
