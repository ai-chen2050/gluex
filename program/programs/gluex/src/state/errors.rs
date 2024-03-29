use anchor_lang::prelude::*;

#[error_code]
pub enum GluXError {
    None,

    #[msg("Description exceeds the maximum character limit")]
    DescExceedMaxChars,

    #[msg("Relations type is not supported")]
    RelationsNotSupport,

    #[msg("Room type is not supported")]
    RoomNotSupport,
    
    #[msg("EventType type is not supported")]
    EventTypeNotSupport,

    #[msg("SubGoal number too many,maximum is five target")]
    SubGoalNumExceed,

    #[msg("Payer account amount insufficient,account amount must bigger than total_incentive_amount")]
    PayerAccountInsufficient,

    #[msg("Locked amount must smaller than total_incentive_amount")]
    LockedAmountInvalid,

    #[msg("The sum of subgoal amount must smaller than total_incentive_amount")]
    SumOfSubgoalAmountInvalid,

    #[msg("UnLocked time must bigger than completion time")]
    UnLockedTimeInvalid,

    #[msg("Parse public key error")]
    ParsePubkeyError,

    #[msg("Invalid subgoal format")]
    InvalidSubgoalFormat,

}