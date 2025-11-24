# GlueX

Next-gen incentive rails for habits, staged goals, families, DAOs and squads. GlueX combines a Next.js front-end with an Anchor program on Solana so anyone can design verifiable rituals, lock value, review proofs, and reward contributors automatically.

## Features

- **Multi-role rooms** – declaratively model issuers, takers, verifiers and vaults.
- **Habit + target orchestration** – schedule checkpoints, surprise payouts and reclaim unused funds.
- **Automated proofs** – upload evidence, run on-chain checks, and release deposits only when agreements hold.
- **Dynamic fee sharing** – every protocol fee funds contributors (see the new `/about` page for details).
- **Wallet-ready UX** – Solana wallet adapter (Phantom, Backpack, etc.) with auto-connect, language toggle and responsive layout.

## Architecture

```
gluex/
├── app/                 # Next.js frontend
│   ├── src/components   # Shared UI components (AppBar, Footer, RequestAirdrop, etc.)
│   ├── src/views        # Home, Goals, Tools and the new About view
│   ├── src/pages        # Next.js routes -> each page imports a view
│   ├── src/contexts     # Wallet, language and network providers
│   ├── src/stores       # Zustand state (notifications, SOL balance)
│   └── src/styles       # Tailwind / DaisyUI setup
├── program/             # Anchor smart contract
│   ├── programs/gluex   # On-chain instructions, accounts + state
│   └── Anchor.toml      # Cluster + build configuration
└── README.md
```

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, DaisyUI, Zustand, Solana wallet adapter.
- **Smart contract:** Anchor framework on Solana (Rust).
- **Tooling:** ESLint, Prettier, Anchor CLI, `create-solana-dapp`.

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Yarn or npm
- Rust + Anchor CLI (for program changes)
- Solana CLI configured for devnet/localnet

### Frontend

```bash
cd app
npm install        # or yarn
npm run dev        # launches http://localhost:3000
```

### Anchor Program

```bash
cd program
anchor build       # compile Rust program
anchor test        # run integration tests
anchor deploy      # deploy to configured cluster
```

Update `Anchor.toml` and environment variables if you target a different cluster or wallet.

## Open-source Contributions & Incentives

GlueX shares protocol fees with anyone who ships verifiable value:

1. **Founder only:** 100% of fees.
2. **Two builders:** 50% founder, 50% second maintainer.
3. **Three builders:** 50% founder, 25% each for contributors two and three.
4. **More builders:** Founder fixed at 50%; remaining 50% distributed by contribution weight.

Read the `/about` page (or visit [https://ai-chen2050.github.io/](https://ai-chen2050.github.io/)) to meet the maintainer, see the avatar wall, and join the fee-sharing program.

## Contributing

1. Pick an issue (feature, UI polish, tooling, docs, translations).
2. Fork the repo and create a descriptive branch.
3. Run `npm run lint` / `npm run test` in `app` and `anchor test` in `program` when relevant.
4. Open a PR describing the change and screenshots/diffs when appropriate.
5. Once merged, your contribution becomes eligible for fee sharing.

## Maintainer & Contributors

[Project maintainer & contributors contact information]

**Blake Chan** – software engineer, innovator and web3 advocate. Blake believes in equal, transparent, decentralized coordination and is committed to advancing the web3 industry globally.

![Contributors](https://contrib.rocks/image?repo=ai-chen2050/gluex)

Questions or partnership ideas? File an issue or reach out via the GitHub profile above.
