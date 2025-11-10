# MarAI Smart Contract Tooling

The frontend now treats Solidity development as an isolated workspace so day-to-day UI installs avoid the Hardhat dependencies that have historically triggered `403` registry errors in constrained environments.

## Getting Started

```bash
cd contracts
npm install
```

This fetches `hardhat`, `@nomicfoundation/hardhat-toolbox`, and the TypeScript helpers defined in [`package.json`](./package.json). If your npm configuration still blocks scoped packages, revisit the troubleshooting checklist in [`../docs/npm-troubleshooting.md`](../docs/npm-troubleshooting.md).

## Common Commands

| Command | Description |
| ------- | ----------- |
| `npm run build` | Compile the Solidity contracts under `contracts/`. |
| `npm run test` | Execute the Hardhat test suite. |
| `npm run lint` | Run Hardhat's static analysis checks. |

The scripts mirror the convenience wrappers in the repository root (`npm run contracts:install`, `npm run contracts:test`) so you can manage the toolchain without leaving the main project directory.

## Environment Variables

The config reads credentials from the repository root `.env` file if present, then falls back to a local `.env` inside `contracts/`. See [`contracts/hardhat.config.ts`](./hardhat.config.ts) for the exact variables required to deploy to Polygon.
