# QSB Frontend

React frontend for the **Qubic–Solana Bridge** — a cross-chain bridge that lets users transfer wQUBIC tokens between the Qubic and Solana networks.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

Copy the environment file and fill in the values:

```bash
cp .env .env.local
```

| Variable                        | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `VITE_SOLANA_RPC_URL`           | Solana RPC endpoint (devnet or mainnet)        |
| `VITE_SOLANA_NETWORK`           | `devnet` or `mainnet-beta`                     |
| `VITE_WQUBIC_MINT_ADDRESS`      | wQUBIC SPL token mint address                  |
| `VITE_QUBIC_NETWORK`            | `mainnet` or `testnet`                         |
| `VITE_QUBIC_RPC_URL`            | Qubic public RPC URL                           |
| `VITE_QUBIC_NODE_RPC_URL`       | Qubic node RPC (proxied, e.g. `/qubic-node`)   |
| `VITE_QUBIC_INDEXER_URL`        | Qubic indexer (proxied, e.g. `/qubic-indexer`) |
| `VITE_QUBIC_CONTRACT_INDEX`     | Bridge contract index on Qubic                 |
| `VITE_QUBIC_SNAP_ID`            | MetaMask Snap ID for Qubic wallet              |
| `VITE_QUBIC_SNAP_VERSION`       | MetaMask Snap version                          |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID                       |
| `VITE_REOWN_PROJECT_ID`         | Reown AppKit project ID                        |
| `VITE_HUB_API_URL`              | Hub aggregator API base URL                    |

## Running locally

```bash
npm install
npm run dev        # starts Vite dev server on http://localhost:5173
```

## Building for production

```bash
npm run build      # type-checks then builds to dist/
npm run preview    # serves the built dist/ locally
```

## Pages

| Route       | Description                                                          |
| ----------- | -------------------------------------------------------------------- |
| `/bridge`   | Initiate a cross-chain transfer                                      |
| `/history`  | Personal transfer history                                            |
| `/activity` | Live bridge activity feed                                            |
| `/admin`    | Operator dashboard — manage oracles, pausers, fees, and bridge state |

## Wallets

**Solana** — connect via [Reown AppKit](https://reown.com) (supports Phantom, Backpack, and all WalletConnect-compatible wallets).

**Qubic** — connect via MetaMask Snap (`@ardata-tech/qubic-wallet`) or WalletConnect.

## Admin dashboard

The `/admin` page is the operator control panel for the bridge. It is visible only when a wallet is connected and automatically detects the connected wallet's role (admin, pauser, oracle, or fee recipient).

**Solana contract**

- View oracles and their claimable wQUBIC fee balances
- Claim oracle fees (per oracle) and protocol fees
- Add / remove oracles and pausers
- Pause / unpause bridge transactions

**Qubic contract**

- View oracles, pausers, and current fee configuration
- Add / remove roles (oracle or pauser)
- Edit oracle threshold, BPS fee, and protocol/oracle fee recipients
- Transfer admin rights
- Pause / unpause bridge transactions

All actions submit on-chain transactions directly from the connected wallet — no backend involvement for signing.

## Tooling

```bash
npm run lint            # oxlint
npm run format          # oxfmt (auto-fix)
npm run format:check    # oxfmt (check only)
npm run typecheck       # tsc --noEmit
npm test                # vitest
npm run storybook       # component explorer on http://localhost:6006
```

A pre-commit hook (Husky) runs typecheck, lint, and format check automatically before each commit.
