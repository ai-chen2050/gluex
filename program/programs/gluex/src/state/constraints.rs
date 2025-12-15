pub const MAXIUMUN_SUBGOALS: usize = 5;
pub const MAXIUMUN_DESCRIPTIONS_LENS: usize = 512;
pub const MAXIUMUN_SUBGOAL_AMOUNT: u64 = 2000;
pub const MAX_SUBGOAL_TITLE_LENGTH: usize = 48;
pub const MAX_PROOF_URI_LENGTH: usize = 128;
pub const HABIT_CHECKPOINTS: usize = 3;
pub const HABIT_INTERVAL_SECONDS: i64 = 7 * 24 * 60 * 60;
pub const MAX_DESCRIPTION_BYTES: usize = 512;
pub const SUB_GOAL_SIZE: usize = MAX_SUBGOAL_TITLE_LENGTH
    + 8 // deadline
    + 8 // incentive amount
    + 1 // status
    + MAX_PROOF_URI_LENGTH
    + 8 // submitted_at
    + 32 // verifier pubkey
    + 8 // auto release
    + 1; // is_active
pub const GOAL_ACCOUNT_BASE_SIZE: usize = 32 // issuer
    + 32 // taker
    + 4 // description string prefix
    + MAX_DESCRIPTION_BYTES
    + 3 // enums room/relations/eventype
    + 72 // u64 fields (9 * 8 bytes)
    + 4 // misc u8/bool counters
    + 64; // padding / future use
pub const GOAL_ACCOUNT_SPACE: usize = 8 // anchor discriminator
    + GOAL_ACCOUNT_BASE_SIZE
    + (SUB_GOAL_SIZE * MAXIUMUN_SUBGOALS);

// fee pool related constraints
pub const MAX_MAINTAINERS: usize = 10;
pub const FEE_POOL_SPACE: usize = 8 // anchor discriminator
    + 32 // founder pubkey
    + 4 // vec length prefix
    + (32 * MAX_MAINTAINERS) // maintainers
    + 16 // protocol fee numerator/denominator (u64 * 2)
    + 1; // bump
