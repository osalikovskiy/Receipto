#!/bin/bash
# Receipto Bootstrap Script
# Run once to initialize the project structure.
# Usage: bash bootstrap.sh

set -e  # exit on any error

echo "🚀 Receipto Bootstrap — initializing project..."
echo ""

# ---- Prerequisites check ----
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install from https://nodejs.org (v20+)"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm not found. Run: npm install -g pnpm"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ git not found"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js v20+ required. You have: $(node -v)"
  exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# ---- Git init ----
if [ ! -d ".git" ]; then
  echo "📦 Initializing git..."
  git init -b main
  echo "✅ Git initialized"
else
  echo "✅ Git already initialized"
fi
echo ""

# ---- Create .gitignore ----
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
.expo/
.turbo/
*.tsbuildinfo

# Environment
.env
.env.local
.env*.local
!.env.example

# IDE
.vscode/
.idea/
*.swp
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# Mobile
apps/mobile/ios/
apps/mobile/android/
*.ipa
*.apk

# Supabase
supabase/.branches/
supabase/.temp/

# OS
Thumbs.db
EOF
echo "✅ .gitignore created"
echo ""

# ---- Monorepo structure ----
echo "🏗️  Creating monorepo structure..."

mkdir -p apps/mobile
mkdir -p apps/web
mkdir -p packages/shared/src
mkdir -p packages/legal-templates/src
mkdir -p packages/ai-prompts/src
mkdir -p supabase/migrations
mkdir -p supabase/functions

echo "✅ Folders created"
echo ""

# ---- Root package.json ----
echo "📄 Creating root package.json..."
cat > package.json << 'EOF'
{
  "name": "receipto",
  "version": "0.0.1",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.6.3"
  },
  "engines": {
    "node": ">=20"
  }
}
EOF
echo "✅ package.json created"
echo ""

# ---- pnpm-workspace.yaml ----
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF
echo "✅ pnpm-workspace.yaml created"

# ---- Turborepo config ----
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {},
    "typecheck": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF
echo "✅ turbo.json created"

# ---- Root tsconfig.json ----
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
EOF
echo "✅ tsconfig.json created"
echo ""

# ---- .env.example ----
cat > .env.example << 'EOF'
# Supabase
SUPABASE_PROJECT_ID=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# RevenueCat
REVENUECAT_PUBLIC_KEY_IOS=
REVENUECAT_PUBLIC_KEY_ANDROID=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# PostHog
POSTHOG_API_KEY=
POSTHOG_HOST=https://eu.posthog.com
EOF
echo "✅ .env.example created"
echo ""

# ---- Shared package skeleton ----
cat > packages/shared/package.json << 'EOF'
{
  "name": "@receipto/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
EOF

cat > packages/shared/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "include": ["src/**/*"]
}
EOF

cat > packages/shared/src/index.ts << 'EOF'
// Shared types and constants for Receipto
// Add cross-package types here.

export * from './types/receipt'
EOF

mkdir -p packages/shared/src/types
cat > packages/shared/src/types/receipt.ts << 'EOF'
export type Receipt = {
  id: string
  user_id: string
  merchant: string
  purchase_date: string // ISO date
  total_amount: number
  currency: 'EUR' | 'CHF' | 'USD'
  ocr_status: 'pending' | 'processed' | 'failed'
  created_at: string
}
EOF

echo "✅ packages/shared scaffolded"
echo ""

# ---- Initial commit prep ----
echo "📝 Preparing initial commit..."

cat > COMMIT_MESSAGE.txt << 'EOF'
chore: bootstrap monorepo structure

- Initialize pnpm workspace + Turborepo
- Add root tsconfig with strict mode
- Add .gitignore, .env.example
- Scaffold packages/shared with Receipt type
- Add CLAUDE.md and docs/ for AI context
- Add .claude/commands/ for slash commands

Refs: docs/02-tech-stack.md, docs/07-roadmap.md
EOF

echo ""
echo "════════════════════════════════════════════"
echo "✨ Bootstrap complete!"
echo "════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "  1. Install root dependencies:"
echo "     pnpm install"
echo ""
echo "  2. Verify everything works:"
echo "     pnpm typecheck"
echo ""
echo "  3. Make first commit:"
echo "     git add ."
echo "     git commit -F COMMIT_MESSAGE.txt"
echo "     rm COMMIT_MESSAGE.txt"
echo ""
echo "  4. Create remote on GitHub (private repo):"
echo "     gh repo create receipto --private --source=. --push"
echo ""
echo "  5. Set up Supabase project (eu-central-1 / Frankfurt)"
echo "     https://supabase.com/dashboard"
echo ""
echo "  6. Copy .env.example to .env.local and fill in values"
echo ""
echo "  7. Start Claude Code in this directory:"
echo "     claude"
echo ""
echo "  Then say: 'Read CLAUDE.md and tell me what we're working on.'"
echo ""
