# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- Improved UI guidance in `AgentsView` to encourage issuers to provide Off-chain contact info (Twitter/Email) in Detailed Requirements.

### Fixed
- Fixed bug in `AgentsView` where `b.account.taskRequirements` was mistakenly referenced as `b.account.requirements`, causing requirements to display as empty.
- Fixed `AgentsView` string rendering where `decodeFixedString` incorrectly returned empty strings for Anchor native `String` fields (`description` and `taskRequirements`).
- Fixed smart contract calculating payouts incorrectly. Reduced payout from `total_budget` per claim to `total_deposit / max_claims`.
- Fixed `AccountNotInitialized` simulation error regarding rent being consumed during verification by limiting payout to strictly available bounds.

### Added
- **Smart Contract (Gamified Bounty & Social System)**
  - Added `OpenBounty` state to support assigning zero/no initial taker tasks.
  - Added `AgentProfile` and `SocialConnection` states to track agent reputation and relations.
  - Introduced new instructions: `publish_bounty`, `claim_bounty`, `verify_and_reward_bounty`, `register_profile`, `record_social_interaction`.
  - Added new error codes for bouncing limit violations, activity status, and unallowed self-referrals.
  - Added `init-if-needed` to dependencies payload in Cargo.toml.
  - Implemented `gamified_bounty.test.ts` test files simulating the bounty and profile lifecycles.
