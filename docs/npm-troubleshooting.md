# npm Installation Troubleshooting

When dependency installs fail, start with the basics below. The main frontend install no longer touches scoped packages, but the Solidity toolchain that lives under [`contracts/`](../contracts) still pulls `@nomicfoundation/hardhat-toolbox`. These steps focus on the `403 Forbidden` response that can appear when fetching those scoped packages.

## 1. Confirm your npm account is verified

A brand-new npm account will receive a verification email. Until the address is confirmed, registry requests that require authentication can respond with `403` errors. Visit the verification link in the email or trigger a new message via `https://www.npmjs.com/forgot`. Once the account is verified, retry the install.

You can double-check the verification state directly from the CLI:

```bash
npm profile get | grep -i "email"
```

When the email shows `"verified": true`, the registry will allow access to scoped packages. If it is still false, use `npm profile verify` or the resend link above before continuing.

## 2. Ensure the public registry is in use

```bash
npm config get registry
npm config set registry https://registry.npmjs.org/
```

Custom registries and mirrors may block scoped packages. Resetting to the default public registry removes that variable.

## 3. Clear local caches and auth state

```bash
npm logout
npm cache clean --force
rm -rf node_modules package-lock.json
```

After clearing the cache you can retry the install:

```bash
npm install
```

## 4. Retry with a clean environment

Some corporate networks or shells can inject proxies. If the error persists, try installing from a different network or a fresh shell session without custom npm configuration files.

## 5. Still stuck?

Consult the npm status page and the package's release feed to confirm the issue is not on the publisher's side. When opening a support ticket, include the output from `npm config list` and the full error log (`npm ERR!`).
