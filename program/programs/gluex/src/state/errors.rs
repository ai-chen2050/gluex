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

    #[msg("Subgoal index out of bounds")]
    SubGoalIndexOutOfBounds,

    #[msg("Subgoal already finalized")]
    SubGoalAlreadyFinalized,

    #[msg("Proof already submitted for this subgoal")]
    ProofAlreadySubmitted,

    #[msg("Proof submission required before verification")]
    ProofMissing,

    #[msg("Only issuer can execute this action")]
    UnauthorizedSigner,

    #[msg("Only taker can execute this action")]
    UnauthorizedTaker,

    #[msg("Surprise trigger time not reached")]
    SurpriseTimeNotReached,

    #[msg("Unlock time not reached")]
    UnlockTimeNotReached,

    #[msg("No funds available to claim")]
    NoFundsAvailable,

    #[msg("Missing subgoals for this event type")]
    MissingSubGoals,

    #[msg("Habit configuration is invalid")]
    HabitConfigInvalid,

    #[msg("Checkpoint interval must be positive")]
    InvalidCheckpointInterval,

    #[msg("Parse public key error")]
    ParsePubkeyError,

    #[msg("Invalid subgoal format")]
    InvalidSubgoalFormat,

    #[msg("Maximum number of maintainers reached")]
    MaxMaintainersReached,

}