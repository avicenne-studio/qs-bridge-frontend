# QS Bridge — Qubic ↔ Solana Bridge

Frontend for bridging wQUBIC tokens between Solana and Qubic, built with React + TypeScript + Vite.

---

## Getting Started

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Copy `.env` and fill in the required values:

| Variable                        | Description                                                |
| ------------------------------- | ---------------------------------------------------------- |
| `VITE_SOLANA_RPC_URL`           | Solana RPC endpoint (e.g. `https://api.devnet.solana.com`) |
| `VITE_SOLANA_NETWORK`           | Solana network: `devnet` or `mainnet-beta`                 |
| `VITE_WQUBIC_MINT_ADDRESS`      | wQUBIC token mint address                                  |
| `VITE_QUBIC_NETWORK`            | Qubic network: `mainnet` or `devnet`                       |
| `VITE_QUBIC_RPC_URL`            | Qubic RPC endpoint (e.g. `https://rpc.qubic.org`)          |
| `VITE_QUBIC_SNAP_ID`            | Qubic MetaMask Snap ID (`npm:@ardata-tech/qubic-wallet`)   |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID                                   |
| `VITE_REOWN_PROJECT_ID`         | Reown AppKit project ID                                    |

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **React Router v7** for routing
- **Tailwind CSS v4** + **Radix UI** for UI components
- **Zustand** for global state (modal system)
- **Reown AppKit** + **`@solana/web3.js`** for Solana wallet integration
- **WalletConnect Sign Client v2** + **`@ardata-tech/qubic-js`** for Qubic wallet integration

---

## Project Structure

```
src/
├── components/     # Reusable UI components
├── domains/        # Feature pages (bridge, history, activity)
├── hooks/          # Business logic hooks
├── lib/
│   ├── bridge/     # Solana program interaction (instructions, PDAs, fee computation)
│   └── qubic/      # Qubic wallet connection logic
├── providers/      # React context providers (Solana wallet, Qubic wallet, modals)
├── stores/         # Zustand stores
├── types/          # Shared TypeScript types
└── utils/          # Formatting and utility helpers
```

### Key files

| File                                 | Role                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `hooks/useBridge.ts`                 | Orchestrates the bridge flow (amount, direction, fees, execution)        |
| `hooks/useBridgeOutbound.ts`         | Creates and sends Solana transactions (outbound + override instructions) |
| `providers/SolanaWalletProvider.tsx` | Solana wallet context with 30s balance polling                           |
| `providers/QubicWalletProvider.tsx`  | Qubic wallet context (WalletConnect & seed phrase), 30s balance polling  |
| `lib/bridge/solana/`                 | Instruction serialization, PDA derivation, transaction sending           |
| `lib/qubic/`                         | Qubic wallet connection methods                                          |
| `stores/modal-store.ts`              | Type-safe global modal state                                             |

---

## Architecture Overview

The app connects two separate wallet contexts — one for Solana (via Reown AppKit) and one for Qubic (via WalletConnect or seed phrase import). The bridge flow is handled entirely on the client: the frontend builds and signs a Solana transaction that creates an **outbound order** on-chain, which is then picked up and executed by an off-chain relayer.

**Solana program:** `qSBGtee9tspoDVmb867Wq6tcR3kp19XN1PbBVckrH7H`  
**wQUBIC mint:** `4bbjhGLSYwku6Y44dqwcroRfj2vHCdiHJ9SUmndc4FVg`

Two on-chain instructions are implemented:

- **`outbound`** — creates a new bridge order (wQUBIC → QUBIC)
- **`override-outbound`** — updates the destination address or relayer fee on a pending order

The `/activity` and `/history` pages fetch real data from the hub backend via `lib/hub/hub-client`.

---

## Available Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Development server with HMR              |
| `npm run build`        | Production build                         |
| `npm run preview`      | Preview the production build             |
| `npm run lint`         | Lint with oxlint                         |
| `npm run format`       | Auto-format with oxfmt                   |
| `npm run format:check` | Check formatting without modifying files |
| `npm run storybook`    | Launch Storybook                         |

---

## Development Notes

- **React Compiler** is enabled — may slow down dev server and build times
- **Pre-commit hook** (Husky) runs lint and format check before every commit
- **`Buffer` polyfill** is included in `src/polyfills.ts` for Node.js crypto lib compatibility
- To add a new modal type, extend the discriminated union in `src/types/modal.ts`
