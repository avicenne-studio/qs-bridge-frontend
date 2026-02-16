# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR, and uses [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for linting and formatting.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Lint and formatting

- **Lint**: `npm run lint` (oxlint)
- **Formatting**: `npm run format` to format, `npm run format:check` to check without modifying

Configuration is in `.oxlintrc.json` and `.oxfmtrc.json`. The pre-commit hook (Husky) runs lint and format check before each commit.
