# Frontend – Agent Notes

## Overview

React 19 + TypeScript + Vite application that provides the user interface for the Qubic ↔ Solana bridge. Users can initiate transfers, track order status, view transaction history, and (via the Admin page) inspect on-chain admin roles and contract state. The Hub's public REST API is the main backend dependency, with direct Bob smart-contract reads also used for some Qubic metadata.

## Tech Stack

- **React 19** with React Compiler (Babel plugin) for automatic memoisation.
- **Vite** (Rolldown bundler) for dev server and production builds.
- **TypeScript** 5.9 in strict mode.
- **Zustand** for global client state (modal store).
- **Viem** for Ethereum/EVM/Solana address handling and Web3 interactions.
- **React Router v6** for client-side routing.
- **Tailwind CSS 4** (`@tailwindcss/vite`) for styling; `tailwind-merge` + `clsx` for className composition.
- **@tanstack/react-table** for data tables.
- **@radix-ui/react-tooltip** for accessible tooltips.
- **oxlint** + **oxfmt** for linting and formatting (not ESLint/Prettier).
- **Vitest** + **@testing-library/react** + **jsdom** for unit/component tests.
- **Storybook 8** for component documentation.
- **Husky** pre-commit hooks enforce lint + format checks.

## Project Structure

```
src/
  App.tsx                        # Root router — redirects / → /activity
  main.tsx                       # React 19 entry (StrictMode + BrowserRouter + providers)
  constants/routes.ts            # Route path constants (bridge, history, activity, admin)
  domains/
    bridge/react/                # BridgePage, amount/direction/fees/override sections, initial & success steps
    history/react/               # HistoryPage, filters (date, direction, status, from/to), table
    activity/react/              # ActivityPage, ActivityTable, use-activity-orders hook
    admin/react/                 # AdminPage, oracle table, address table, Solana/Qubic admin panels
  components/
    layout/                      # MainLayout, Sidebar (sidebar-link, status-item/section), TopBar, TabBar
    wallet-area/                 # WalletArea, ConnectWalletButton, DisconnectWalletButton,
    |                            #   wallet-modal.tsx (Solana), qubic-wallet-modal.tsx (Qubic connection pages)
    core/                        # Button, icons (QubicIcon, SolanaIcon, logomark)
    table/                       # DataTable, pagination-button, cell variants (basic, head, order-id, order-status, address, date)
    amounts/                     # AmountInput, amounts.utils.ts
    callout/                     # Callout banner component
    modals/                      # override-order-modal.tsx
    network-direction-information/
    network-tag/                 # NetworkTag chip (qubic | solana)
    stats/                       # ComboTextStats
    ui/                          # calendar.tsx, tooltip.tsx (Radix-based)
  providers/
    WalletProviders.tsx          # Composes SolanaWalletProvider + QubicWalletProvider
    SolanaWalletProvider.tsx     # @solana/wallet-adapter context
    QubicWalletProvider.tsx      # Qubic wallet context
    BridgeHealthProvider.tsx     # Fetches /api/health/* and exposes via useBridgeHealthContext()
    modal-provider.tsx           # Renders the active modal from modal-store
  stores/
    modal-store.ts               # Zustand store: openModal(type, data) / closeModal()
  hooks/
    useBridge.ts                 # Top-level bridge form state + submission logic; Solana → Qubic fetches current Qubic orderEra before submit
    useBridgeInbound.ts          # Solana → Qubic bridge flow
    useBridgeOutbound.ts         # Qubic → Solana bridge flow
    useBridgeHealth.ts           # Polls /api/health/bridge + /api/health/oracles
    useFeeEstimate.ts            # Calls POST /api/orders/estimate
    useOrderTracking.ts          # Polls GET /api/orders/trx-hash/:hash after transfer
    useBalancePolling.ts         # Polls on-chain wallet balance
    useSolanaWallet.ts           # Solana wallet adapter hooks
    useSolanaProvider.ts         # Solana connection provider access
    useSolanaAdmin.ts            # Calls Solana contract admin instructions
    useQubicSignClient.ts        # Qubic signing client
    useQubicAdmin.ts             # Calls Qubic contract admin procedures
    useAdminRoles.ts             # Fetches on-chain admin role assignments
    use-fake-loading.ts          # UI loading-state helper
    use-toggle.ts                # Simple boolean toggle
  types/
    modal.ts                     # ModalType / ModalData / ModalState discriminated unions
  utils/
    classnames.ts                # cn() — clsx + tailwind-merge
    address.ts                   # formatAddress() — shortened display
  styles/index.css               # Tailwind entry
```

## Routing

Four top-level pages defined in `constants/routes.ts`, rendered inside `MainLayout`. The root `/` redirects to `/activity`.

| Path        | Page         | Description                                                                   |
| ----------- | ------------ | ----------------------------------------------------------------------------- |
| `/bridge`   | BridgePage   | Transfer initiation — direction, amount, fee preview, submit.                 |
| `/history`  | HistoryPage  | Per-wallet order history with multi-filter UI.                                |
| `/activity` | ActivityPage | Global bridge activity feed (no wallet required).                             |
| `/admin`    | AdminPage    | On-chain admin panel: oracle list, pauser list, Solana + Qubic admin actions. |

## Providers

Providers are composed in `main.tsx`. Stack (outermost first):

1. `WalletProviders` → `SolanaWalletProvider` → `QubicWalletProvider` — wallet contexts.
2. `BridgeHealthProvider` — fetches bridge health on mount; exposes `useBridgeHealthContext()`.
3. `modal-provider` — renders the modal from `modal-store` based on active `ModalType`.

## State Management

- **Zustand** is used for the global **modal store** (`src/stores/modal-store.ts`): `openModal(type, data)` / `closeModal()`. Modal type is a discriminated union defined in `src/types/modal.ts`.
- Most domain state is **local to hooks** (bridge form, history filters, order tracking) — no global store for bridge state.

## Key Conventions

- Use `cn()` from `src/utils/classnames.ts` (wraps `clsx` + `tailwind-merge`) for all conditional `className` composition.
- Use `formatAddress()` from `src/utils/address.ts` for shortened address display.
- Storybook stories live alongside components as `*.stories.tsx`.
- Tests live alongside components/stores as `*.test.ts` / `*.test.tsx`.
- **oxlint** (not ESLint) — run `npm run lint`; **oxfmt** (not Prettier) — run `npm run format`.

## Hub API Integration

The frontend consumes the Hub's public REST API. Base URL is set via environment variable. Key endpoints used:

| Hook                  | Endpoint                         | Purpose                                          |
| --------------------- | -------------------------------- | ------------------------------------------------ |
| `useBridgeHealth`     | `GET /api/health/bridge`         | Bridge pause state.                              |
| `useBridgeHealth`     | `GET /api/health/oracles`        | Oracle count + relayer fees.                     |
| `useFeeEstimate`      | `POST /api/orders/estimate`      | Fee estimation before confirm.                   |
| `useOrderTracking`    | `GET /api/orders/trx-hash/:hash` | Poll order status after transfer.                |
| `use-history-orders`  | `GET /api/orders`                | Per-wallet order history (`participant` filter). |
| `use-activity-orders` | `GET /api/orders`                | Global activity feed (no filter).                |

The Hub exposes a full OpenAPI spec at `/docs` (Swagger UI).

## Status Model

Hub statuses currently handled by the frontend:

- `pending`
- `ready-for-relay`
- `transaction-broadcasted`
- `relayed`
- `failed`
- `finalized`

Frontend display mapping:

- `transaction-broadcasted` → `in-progress`
- `relayed` → `in-progress`

The history filter label `In Progress` maps to both Hub statuses `transaction-broadcasted` and `relayed`.

Relevant files:

- `src/lib/hub/hub.types.ts`
- `src/lib/hub/hub-mappers.ts`
- `src/hooks/useOrderTracking.ts`

## Direct Qubic Reads

For some Qubic data the frontend talks directly to Bob:

- `src/lib/bridge/qubic/query.ts` uses Bob `/querySmartContract`
- `useBridge.ts` reads Qubic config to obtain the current `orderEra` before Solana → Qubic submission

In local/dev setups, Vite proxies `/qubic-node` to Bob to avoid browser CORS issues.

## Scripts

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run typecheck    # tsc --noEmit
npm run lint         # oxlint
npm run format       # oxfmt
npm test             # vitest --run
npm run test:ui      # vitest with UI
npm run storybook    # Storybook dev
```

## Testing

- **Vitest** with `jsdom` environment; component tests use `@testing-library/react`.
- Test files live next to source files (co-located).
- No 100% coverage gate currently enforced (unlike Hub/Oracle).
