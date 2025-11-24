#!/bin/bash

# Ecosystem Audit - Dependency Installation Script
# Installs required testing dependencies for validation and integration tests

set -e

echo "📦 Installing Ecosystem Audit Dependencies..."
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the /entrolytics directory."
  exit 1
fi

echo "Installing Jest dependencies..."
pnpm add -D @jest/types jest ts-jest @types/jest

echo ""
echo "Installing Playwright dependencies..."
pnpm add -D @playwright/test

echo ""
echo "Installing TypeScript execution..."
pnpm add -D tsx

echo ""
echo "Installing additional test utilities..."
pnpm add -D npm-run-all

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "  1. Run validation scripts: npm run validate:all"
echo "  2. Run integration tests: npm run test:integration"
echo "  3. Run end-to-end tests: npm run test:e2e"
echo "  4. Run complete audit: npm run audit:ecosystem"
echo ""
echo "For more information, see AUDIT_IMPLEMENTATION.md"
