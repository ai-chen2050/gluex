use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
#[instruction(referrer: Option<Pubkey>)]
pub struct RegisterProfile<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 8 + 4 + 32 + 8 + 1,
        seeds = [b"agent-profile", payer.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, AgentProfile>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn register_profile(ctx: Context<RegisterProfile>, referrer: Option<Pubkey>) -> Result<()> {
    let profile = &mut ctx.accounts.profile;
    require!(
        referrer != Some(ctx.accounts.payer.key()),
        GluXError::SelfReferralNotAllowed
    );
    
    profile.owner = ctx.accounts.payer.key();
    profile.reputation_score = 0;
    profile.tasks_completed = 0;
    profile.invited_by = referrer.unwrap_or_default();
    profile.joined_at = Clock::get()?.unix_timestamp;
    profile.bump = ctx.bumps.profile;
    
    Ok(())
}

#[derive(Accounts)]
pub struct RecordSocialInteraction<'info> {
    #[account(
        init_if_needed,
        payer = user_a,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = [
            b"social-conn",
            user_a.key().as_ref(),
            user_b.key().as_ref()
        ],
        bump
    )]
    pub connection: Account<'info, SocialConnection>,
    #[account(mut)]
    pub user_a: Signer<'info>,
    /// CHECK: Target user to interact with
    pub user_b: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn record_social_interaction(ctx: Context<RecordSocialInteraction>) -> Result<()> {
    let connection = &mut ctx.accounts.connection;
    if connection.interaction_count == 0 {
        connection.user_a = ctx.accounts.user_a.key();
        connection.user_b = ctx.accounts.user_b.key();
        connection.bump = ctx.bumps.connection;
    }
    connection.interaction_count = connection.interaction_count.saturating_add(1);
    Ok(())
}
