# App - Frontend

Next.js frontend with TypeScript, Tailwind CSS, DaisyUI.

## OVERVIEW
Web3 dApp UI for GlueX protocol with wallet connection, goal management, and language switching.

## STRUCTURE
```
app/src/
├── components/     # UI components (AppBar, Footer, RequestAirdrop, etc.)
├── views/         # Page content (home, goals, fund, about, leaders)
├── pages/         # Next.js routes → each imports a view
├── contexts/      # Wallet, language, auto-connect providers
├── stores/        # Zustand state (notifications, SOL balance)
├── utils/         # Solana helpers, gtag, fetchers
├── models/        # Type definitions
├── idl/           # Anchor IDL for type-safe contract calls
└── styles/        # Global CSS, Tailwind config
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Wallet connection | `contexts/ContextProvider.tsx` |
| Auto-connect | `contexts/AutoConnectProvider.tsx` |
| Language toggle | `contexts/LanguageProvider.tsx` |
| Notifications | `components/Notification.tsx` + `stores/useNotificationStore.ts` |
| Contract calls | `hooks/useGlueXProgram.ts` |
| Solana helpers | `utils/solana.ts` |
| Styles | `styles/globals.css`, `tailwind.config.js` |

## CONVENTIONS
- Components use `React.FC` type
- Named exports + default export pattern
- Dynamic imports for wallet adapter (`ssr: false`)
- Wallet button via `@solana/wallet-adapter-react-ui`
- Context providers wrap app in `_app.tsx`

## ANTI-PATTERNS
- **Do not** use wallet adapter server-side (use dynamic imports with `ssr: false`)
- **Do not** hardcode RPC endpoints - use `contexts/ContextProvider`
- **Do not** bypass Notifications store - show all user-facing messages

## COMMANDS
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
```
