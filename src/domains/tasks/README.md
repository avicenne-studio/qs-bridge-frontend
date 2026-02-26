# Tasks Domain (Hexagonal)

This module follows a hexagonal architecture:

- **Ports** define the business boundary (`ports/tasks.service.d.ts`).
- **Adapters** implement the port for different runtimes (localStorage, in-memory).
- **Store** contains all business logic and state transitions.
- **React** is a thin view layer that renders store state and calls store methods.

## Structure

- `ports/` – service interfaces used by the store.
- `adapters/` – infrastructure implementations of the port.
- `tasks.store.ts` – state + business logic, built via injected services.
- `react/` – flat UI components that render store state.

## Dependency Resolution

`tasks.store.ts` exposes `resolveDependencies()` so the default runtime service can
be chosen at startup (for example: in-memory for tests, localStorage in the app).
Tests should **inject** dependencies via `createTasksStore()` or `initTasksStore()`.

## Unit Testing Stores

Store tests should focus on state transitions and side-effects without React:

- Arrange: create a store with a fake adapter (e.g. `MemoryTasksService`).
- Act: call store methods (`load`, `addTask`, `toggleTask`, etc.).
- Assert: verify state shape and adapter call counts.

See: `tasks.store.test.ts`.

## UI / Integration Tests

React component tests validate rendering and interactions with the store:

- Initialize the store with a memory adapter via `initTasksStore()`.
- Render the component (e.g. `TasksPage`).
- Interact via Testing Library and assert on the DOM.

See: `react/tasks.page.test.tsx`.
