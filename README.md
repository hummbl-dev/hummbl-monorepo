# HUMMBL Monorepo

[![CI](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/ci.yml)
[![PR Checks](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/pr.yml/badge.svg)](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/pr.yml)

A monorepo for all HUMMBL projects and packages.

## Structure

```
hummbl-monorepo/
├── apps/          # Applications (web apps, APIs, etc.)
├── packages/      # Shared packages and libraries
└── tools/         # Development tools and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Adding a New Package

1. Create a new directory in `packages/` or `apps/`
2. Add a `package.json` with a unique name (e.g., `@hummbl/package-name`)
3. The workspace manager will automatically detect it

## Adding a New App

1. Create a new directory in `apps/`
2. Add a `package.json` with a unique name
3. Reference shared packages using `@hummbl/package-name`

## Contributing

[Add your contributing guidelines here]

## License

[Add your license here]

