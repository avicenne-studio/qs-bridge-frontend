# Frontend – Agent Notes

## Overview

React 19 + TypeScript + Vite application that provides the user interface for the Qubic ↔ Solana bridge. Users can initiate transfers, track order status, and view transaction history. The Hub's public REST API is the sole backend dependency.

## Tech Stack

- **React 19** with React Compiler (Babel plugin) for automatic memoisation.
- **Vite** (Rolldown bundler) for dev server and production builds.
- **TypeScript** 5.9 in strict mode.
- **Zustand** for global client state.
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
  App.tsx                   # Root router — Bridge, History, Activity pages
  main.tsx                  # React 19 entry (StrictMode + BrowserRouter)
  constants/routes.ts       # Route path constants
  domains/
    activity/               # Transaction history domain
      activity.types.ts     # ActivityRow type (status, orderId, direction, from, to, amount, date)
      activity.constants.ts # Column definitions + status label mappings
      react/                # ActivityPage + ActivityTable components
    tasks/                  # (scaffold domain — to be replaced by bridge domain)
      tasks.store.ts        # Zustand store (load, addTask, toggleTask, etc.)
      ports/                # ITasksService interface
      adapters/             # LocalStorageTasksService, MemoryTasksService
  components/
    layout/                 # MainLayout, Sidebar, TopBar, TabBar
    wallet-area/            # WalletArea slot, ConnectWalletButton, DisconnectWalletButton
    core/                   # Button, icons (QubicIcon, SolanaIcon, logomark)
    table/                  # DataTable wrapper
  hooks/
    use-toggle.ts
  styles/index.css          # Tailwind entry
```

## State Management

- **Zustand** stores follow the pattern: `create<Store>()(immer(...))` with selectors exported separately.
- Service ports (`ITasksService`) and adapters pattern allow swapping implementations in tests.
- `initTasksStore(service)` helper wires up services in tests and app bootstrap.

## Routing

Three top-level pages defined in `constants/routes.ts` and rendered inside `MainLayout`:

- `/` — Bridge (transfer initiation).
- `/history` — Order history.
- `/activity` — Transaction activity feed (reads Hub `/api/orders`).

## Key Conventions

- Use `cn()` from `src/utils/classnames.ts` (wraps `clsx` + `tailwind-merge`) for all conditional `className` composition.
- Use `formatAddress()` from `src/utils/address.ts` for shortened address display.
- Storybook stories live alongside components as `*.stories.tsx`.
- Tests live alongside components/stores as `*.test.ts` / `*.test.tsx`.
- **oxlint** (not ESLint) — run `npm run lint`; **oxfmt** (not Prettier) — run `npm run format`.

## Hub API Integration

The frontend consumes the Hub's public REST API. Base URL is set via environment variable. Key endpoints used:

- `GET /api/orders` — paginated order list for the history and activity views; supports `participant` filter for per-wallet history.
- `GET /api/orders/trx-hash/:hash` — order lookup after a user-initiated transfer.
- `POST /api/orders/estimate` — fee estimation before the user confirms a transfer.
- `GET /api/health/bridge` — check if the bridge is paused before allowing transfer submission.
- `GET /api/health/oracles` — optional: display oracle network health in the UI.

The Hub exposes a full OpenAPI spec at `/docs` (Swagger UI).

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
- Store tests use `MemoryTasksService` to avoid localStorage side effects.
- Test files live next to source files (co-located).
- No 100% coverage gate currently enforced (unlike Hub/Oracle).
