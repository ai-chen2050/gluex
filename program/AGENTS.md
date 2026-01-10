# Program - Anchor Smart Contract

Solana program written in Rust using Anchor framework for on-chain goal tracking and fee distribution.

## OVERVIEW
GlueX protocol core: goal creation, proof verification, incentive distribution, and fee pool management.

## STRUCTURE
```
program/
├── programs/gluex/src/
│   ├── lib.rs              # Program entry point, instruction handlers
│   ├── instructions/       # Instruction implementations (create, manage, fee)
│   │   ├── create.rs       # setup_goal, migrate_total_goal
│   │   ├── manage.rs       # submit_proof, review_subgoal, trigger_surprise, claim_unused
│   │   └── fee.rs         # fee pool operations
│   ├── state/              # Account structures, constraints, errors
│   │   ├── user_state.rs   # TotalGoal, FeePool, SubGoal, enums
│   │   ├── user_state_impl.rs
│   │   ├── constraints.rs  # Constants (MAX_SUBGOALS, etc.)
│   │   └── errors.rs       # Custom error codes
│   └── define.rs
├── tests/                  # TypeScript tests (ts-mocha + chai)
└── Anchor.toml            # Cluster config, program ID
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Entry point | `programs/gluex/src/lib.rs` |
| Goal creation | `instructions/create.rs:setup_goal` |
| Proof review | `instructions/manage.rs` |
| Fee operations | `instructions/fee.rs` |
| Account structures | `state/user_state.rs` |
| Constraints | `state/constraints.rs` |
| Errors | `state/errors.rs` |
| Integration tests | `tests/` |

## CONVENTIONS
- PDA seeds: Use `b"gluex-*"` prefix for consistency
- Program ID: `6ExBjE2VPbP8YZhWoXuBgSac5MHS3J8dfviUFuUeBqZe` (check both `lib.rs` and `Anchor.toml`)
- Error codes: Defined in `state/errors.rs`, use custom error types
- Account validation: Use Anchor's `#[account(...)]` attributes
- Fixed-size arrays for on-chain strings (`[u8; N]`)

## ANTI-PATTERNS
- **Do not** use `unwrap()` - use `?` operator for error propagation
- **Do not** change program ID in `lib.rs` without updating `Anchor.toml`
- **Do not** forget to run `anchor build` twice after changing program ID
- **Do not** exceed storage limits defined in `constraints.rs`

## COMMANDS
```bash
anchor build            # Compile program
anchor deploy           # Deploy to configured cluster
anchor test             # Run all tests (ts-mocha)
npm test                # Alias for anchor test
npm run lint            # Prettier check
npm run lint:fix        # Prettier format

# Single test (edit package.json or use mocha directly):
npm test -- tests/fee_pool.test.ts
```

## NOTES
- Default cluster: devnet (check `Anchor.toml`)
- Wallet path: `~/.config/solana/id.json`
- Fee pool PDA: `gluex-fee-pool` seed
- Goal PDA: `gluex-goals + issuer + taker + goal_id`
- After program ID change: run `anchor build` → update ID → `anchor build` → deploy
