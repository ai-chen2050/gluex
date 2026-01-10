# GlueX - Agent Knowledge Base

**Generated:** 2025-01-10
**Stack:** Next.js + TypeScript + Anchor (Rust) on Solana

## OVERVIEW
GlueX is an on-chain incentive coordination protocol combining a Next.js frontend with an Anchor Solana program for verifiable goal tracking, proof verification, and automated rewards.

## STRUCTURE
```
gluex/
├── app/              # Next.js frontend (TS/React, Tailwind/DaisyUI)
├── program/          # Anchor smart contract (Rust)
└── AGENTS.md
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| UI components | `app/src/components/` | Shared reusable components |
| Pages/Routes | `app/src/pages/` | Next.js pages, each imports a view |
| Views | `app/src/views/` | Main content: home, goals, fund, about, leaders |
| Wallet/Web3 | `app/src/contexts/` | ContextProvider, LanguageProvider |
| State | `app/src/stores/` | Zustand stores (notifications, balance) |
| Smart contract | `program/programs/gluex/src/` | lib.rs, instructions/, state/ |
| Tests | `program/tests/` | ts-mocha + chai tests |
| Utils | `app/src/utils/` | Solana helpers, fetchers, gtag |

## CONVENTIONS

### TypeScript (app/)
- Import style: Named imports preferred (`import { FC } from 'react'`)
- Component naming: PascalCase, export default + named export
- Use `React.FC` for function components (not `React.FunctionComponent`)
- Single quotes for strings
- Use `const` for variables, `let` only when reassignment needed
- No strict mode enabled in tsconfig.json (`strict: false`)

### Rust (program/)
- Module structure: Separate `instructions/` and `state/` modules
- Enums derive Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq, Eq
- Structs with fixed-size arrays for on-chain storage
- PDA seeds: Use `b"gluex-*"` prefix for consistency
- Error messages in `state/errors.rs` with `error_code!` macro

### Styling
- Tailwind CSS + DaisyUI (Solana theme)
- className: kebab-case, Tailwind utility classes
- Dark mode via `darkMode: "media"`
- Avoid inline styles; prefer utility classes

### Error Handling
- Frontend: Try-catch for async operations, use Notifications store
- Rust: Anchor `Result<()>`, custom errors in `state/errors.rs`
- Contract: PDA derivation failures handled gracefully

## ANTI-PATTERNS

### TypeScript
- **Do not** use `any` types (tsconfig allows but avoid)
- **Do not** mix quote styles (use single quotes consistently)
- **Do not** add unnecessary `/* eslint-disable */` comments

### Rust
- **Do not** use `unwrap()` in production code - use `?` propagation
- **Do not** hardcode PDA seeds without documenting
- **Do not** change the program ID without updating both `Anchor.toml` and `lib.rs`

## COMMANDS

### Frontend (app/)
```bash
cd app
npm install              # Install dependencies
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint check
```

### Program (program/)
```bash
cd program
anchor build             # Compile Rust program
anchor deploy            # Deploy to cluster (check Anchor.toml)
anchor test              # Run all tests via ts-mocha
# Run single test:
npm test -- tests/fee_pool.test.ts  # or edit package.json test script
```

### Linting
```bash
cd program
npm run lint             # Prettier check
npm run lint:fix         # Prettier format
```

## NOTES
- Solana cluster: devnet by default (check `Anchor.toml`)
- Wallet: Phantom/Backpack via `@solana/wallet-adapter-react`
- Protocol fees go to FeePool PDA (`gluex-fee-pool` seed)
- Goal PDAs: `gluex-goals + issuer + taker + goal_id`
- When changing program ID: update `declare_id!` in `lib.rs` AND `Anchor.toml`, then `anchor build` twice
