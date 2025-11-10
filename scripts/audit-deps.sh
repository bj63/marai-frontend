#!/bin/bash
set -euo pipefail

echo "🔍 Starting dependency security audit..."

echo "1. Scanning for secrets..."
grep -R "sk_live\|pk_live\|SUPABASE_KEY\|PRIVATE_KEY" --exclude-dir=node_modules --color=never . || true

echo "2. Running npm audit..."
npm audit --audit-level=high

echo "3. Checking for unused deps..."
npx depcheck

echo "4. Validating lockfile..."
npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npmjs.org,registry.npmjs.org

echo "5. Checking for outdated packages..."
npm outdated || true

echo "✅ Audit complete!"
