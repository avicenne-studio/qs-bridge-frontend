# QS Bridge — Qubic ↔ Solana Bridge

Web interface for bridging tokens between the **Solana** network (wQUBIC) and the **Qubic** network (native QUBIC) via an on-chain Solana program.

---

## Overview

QS Bridge allows users to transfer **wQUBIC** tokens (wrapped QUBIC on Solana devnet) to native **QUBIC** tokens on Qubic mainnet. The app interacts directly with a Solana program to create bridge orders (outbound orders), which are then processed by an off-chain relayer.

**Currently supported direction:** Solana → Qubic

**Solana Program:** `qSBGtee9tspoDVmb867Wq6tcR3kp19XN1PbBVckrH7H`  
**wQUBIC Mint:** `4bbjhGLSYwku6Y44dqwcroRfj2vHCdiHJ9SUmndc4FVg`

---

## Tech Stack

| Category      | Technologies                                                                               |
| ------------- | ------------------------------------------------------------------------------------------ |
| Framework     | React 19, TypeScript, Vite                                                                 |
| Routing       | React Router v7                                                                            |
| UI            | Tailwind CSS v4, Radix UI, Lucide React                                                    |
| State         | Zustand (modal store)                                                                      |
| Solana Wallet | Reown AppKit, `@solana/web3.js`                                                            |
| Qubic Wallet  | WalletConnect Sign Client v2, `@ardata-tech/qubic-js`, `@qubic-lib/qubic-ts-vault-library` |
| Lint/Format   | oxlint, oxfmt                                                                              |
| Tests/Dev     | Vitest, Storybook                                                                          |

---

## Project Architecture

```
src/
├── main.tsx              # React entry point with providers
├── App.tsx               # Main routing
├── components/           # Reusable UI components (buttons, inputs, tables, modals...)
├── domains/              # Feature pages
│   ├── bridge/           # Bridge page (main flow)
│   ├── history/          # Transaction history
│   └── activity/         # Live activity dashboard
├── hooks/                # Business logic hooks
│   ├── useBridge.ts          # Bridge flow orchestration
│   ├── useBridgeOutbound.ts  # Solana transaction creation & sending
│   ├── useSolanaWallet.ts    # Solana wallet access (Reown)
│   └── useQubicSignClient.ts # Qubic WalletConnect session
├── lib/
│   ├── bridge/           # On-chain logic (instructions, PDAs, fees, amounts)
│   │   └── solana/       # Instruction serialization, transaction sending
│   └── qubic/            # Qubic wallet connection methods
├── providers/            # React context providers
│   ├── SolanaWalletProvider.tsx  # Solana wallet + balance polling
│   ├── QubicWalletProvider.tsx   # Multi-method Qubic wallet + polling
│   └── modal-provider.tsx        # Global modal rendering
├── stores/               # Zustand stores
│   └── modal-store.ts    # Global modal state
├── types/                # Shared TypeScript definitions
├── constants/            # App routes
└── utils/                # Helpers (formatting, classnames)
```

---

## Solana Integration

The frontend interacts directly with the Solana program via `@solana/web3.js`. Two instructions are supported:

**`outbound`** — Initiates a wQUBIC → QUBIC transfer:

- Generates a random 32-byte nonce
- Derives an `outbound_order` PDA from `(networkOut=1, nonce)`
- Serializes the instruction (117 bytes): discriminator, network, token, amount, Qubic destination address, relayer fee, nonce
- Estimates priority fees from recent transaction history (fallback: 50k microlamports)
- Sends the transaction and waits for `"confirmed"` confirmation

**`override-outbound`** — Modifies a pending order:

- Allows updating the Qubic destination address and/or relayer fee
- Requires a signature from the original Solana wallet

**Protocol fees:**

- Oracle fee: 1% of the amount (`BPS_FEE = 100`)
- Protocol fee: 10% of the oracle fee (`PROTOCOL_FEE_BPS_OF_BPS = 1000`)

---

## Qubic Wallet Connection

The `QubicWalletProvider` supports 4 connection methods:

| Method            | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| **WalletConnect** | QR code scan or mobile deep link (`qubic-wallet://pairwc/`) via Sign Client v2 |
| **MetaMask Snap** | MetaMask extension with the `npm:@ardata-tech/qubic-wallet` snap (v1.0.7)      |
| **Seed phrase**   | Direct import of a seed phrase (55+ characters) or hex private key (64 chars)  |
| **Vault file**    | Encrypted vault file unlocked with a password                                  |

WalletConnect sessions are persisted and automatically restored on app load. The balance is refreshed every 30 seconds for all connection methods.

---

## Main Flow — Bridge Solana → Qubic

```
1. The user connects their Solana wallet (via Reown AppKit)
   and their Qubic wallet (WalletConnect / MetaMask / Seed / Vault)

2. On /bridge:
   - Enter the wQUBIC amount to send
   - Enter the relayer fee (in wQUBIC)
   - View source (Solana) and destination (Qubic) wallets
   - View computed protocol fees

3. Click "Bridge" → useBridgeOutbound.sendOutbound():
   - Generates a 32-byte nonce
   - Derives the outbound_order PDA
   - Estimates priority fees
   - Signs and sends the transaction
   - Waits for confirmation

4. Success step displays:
   - Transaction signature
   - Solscan explorer link

5. (Optional) Override the order:
   - "Override Order" modal accessible from the success screen
   - Allows updating the destination address or relayer fee
```

---

## Pages & Routes

| Route       | Page                             | Status      |
| ----------- | -------------------------------- | ----------- |
| `/bridge`   | Bridge form                      | Functional  |
| `/activity` | Live activity dashboard          | Mocked data |
| `/history`  | Transaction history with filters | Mocked data |

> The `/activity` and `/history` pages are visually complete but have no backend connected yet — they display static data.

---

## Environment Variables

Copy `.env` and fill in the values:

| Variable                        | Description                                | Example                         |
| ------------------------------- | ------------------------------------------ | ------------------------------- |
| `VITE_SOLANA_RPC_URL`           | Solana RPC endpoint                        | `https://api.devnet.solana.com` |
| `VITE_SOLANA_NETWORK`           | Solana network (`devnet` / `mainnet-beta`) | `devnet`                        |
| `VITE_WQUBIC_MINT_ADDRESS`      | wQUBIC mint address                        | `4bbjhGLSYwku6Y44...`           |
| `VITE_QUBIC_NETWORK`            | Qubic network (`mainnet` / `devnet`)       | `mainnet`                       |
| `VITE_QUBIC_RPC_URL`            | Qubic RPC endpoint                         | `https://rpc.qubic.org`         |
| `VITE_QUBIC_SNAP_ID`            | Qubic MetaMask Snap ID                     | `npm:@ardata-tech/qubic-wallet` |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID                   | `e8b22b...`                     |
| `VITE_REOWN_PROJECT_ID`         | Reown AppKit project ID                    | `cf0e9c...`                     |

---

## Installation & Setup

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Available Scripts

| Script                 | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Development server with HMR        |
| `npm run build`        | Production build                   |
| `npm run preview`      | Preview the production build       |
| `npm run lint`         | Lint (oxlint)                      |
| `npm run format`       | Auto-format (oxfmt)                |
| `npm run format:check` | Check formatting without modifying |
| `npm run storybook`    | Launch Storybook                   |

---

## Development Notes

- **React Compiler** is enabled — may impact dev server and build performance
- **Pre-commit hook** (Husky): lint + format check on every commit
- **`Buffer` polyfill** included in `src/polyfills.ts` for Node.js crypto lib compatibility
- **Modal system** built on Zustand + Radix UI Dialog — add new modal types in `src/types/modal.ts`
