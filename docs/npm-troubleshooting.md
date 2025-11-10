# npm Installation Troubleshooting

When dependency installs fail, start with the basics below. The main frontend install no longer touches scoped packages, but the Solidity toolchain that lives under [`contracts/`](../contracts) still pulls `@nomicfoundation/hardhat-toolbox`. These steps focus on the `403 Forbidden` response that can appear when fetching those scoped packages and the `ETARGET` error that shows up when npm tries to resolve a version that does not exist.
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

## 5. Railway or CI builds still resolve 4.1.0?

Railway keeps a build cache across deployments. If a previous image baked in a `package-lock.json` that referenced `@nomicfoundation/hardhat-toolbox@4.1.0`, the cache can force the installer to keep requesting that tag. The repository now ships an npm `override` for the toolbox and a root `.npmrc` that forces the public registry, but the cache still needs to be cleared once.

1. Open the Railway service → **Settings** → **Deployments** and trigger a **Clear build cache**.
2. Redeploy so that Railway clones the latest commit and resolves dependencies again. The override pins the toolbox to `4.0.0`, which is the latest published release.
3. If you manage your own Dockerfile, delete `package-lock.json` and `node_modules` inside the image before running `npm install` to avoid stale metadata.

Once the cache is cleared the build should proceed without requesting the non-existent `4.1.0` version.

## 6. Still stuck?

Consult the npm status page and the package's release feed to confirm the issue is not on the publisher's side. When opening a support ticket, include the output from `npm config list` and the full error log (`npm ERR!`).
