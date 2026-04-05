#!/bin/bash
# ============================================================
# Agent007 - Setup Script for Test Launch
# ============================================================

set -e

echo "=========================================="
echo "  Agent007 - Test Launch Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check() {
  if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}[OK]${NC} $1"
  else
    echo -e "  ${RED}[FAIL]${NC} $1"
    return 1
  fi
}

# Step 1: Check prerequisites
echo "1. Checking prerequisites..."
command -v node >/dev/null 2>&1 && check "Node.js $(node -v)" || { echo -e "  ${RED}[FAIL]${NC} Node.js not installed"; exit 1; }
command -v npm >/dev/null 2>&1 && check "npm $(npm -v)" || { echo -e "  ${RED}[FAIL]${NC} npm not installed"; exit 1; }
echo ""

# Step 2: Check .env.local
echo "2. Checking environment configuration..."
if [ -f "apps/web/.env.local" ]; then
  check "apps/web/.env.local exists"

  # Validate required vars
  REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "ANTHROPIC_API_KEY" "ENCRYPTION_KEY")
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" apps/web/.env.local 2>/dev/null; then
      echo -e "  ${GREEN}[OK]${NC} ${var} is set"
    else
      echo -e "  ${YELLOW}[WARN]${NC} ${var} is missing in .env.local"
    fi
  done
else
  echo -e "  ${YELLOW}[WARN]${NC} apps/web/.env.local not found"
  echo ""
  echo "  Creating from template..."
  cp .env.example apps/web/.env.local
  echo -e "  ${YELLOW}[ACTION]${NC} Edit apps/web/.env.local with your credentials"
  echo ""
fi
echo ""

# Step 3: Install dependencies
echo "3. Installing dependencies..."
npm install
check "Dependencies installed"
echo ""

# Step 4: Build
echo "4. Building web application..."
npx turbo build --filter=web
check "Web app built"
echo ""

# Step 5: Generate encryption key if not set
echo "5. Security check..."
if [ -f "apps/web/.env.local" ] && grep -q "^ENCRYPTION_KEY=your-" apps/web/.env.local 2>/dev/null; then
  NEW_KEY=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p -c 64)
  echo -e "  ${YELLOW}[ACTION]${NC} Generated encryption key. Add to .env.local:"
  echo -e "  ENCRYPTION_KEY=${NEW_KEY}"
else
  check "Encryption key appears configured"
fi
echo ""

echo "=========================================="
echo -e "  ${GREEN}Setup complete!${NC}"
echo "=========================================="
echo ""
echo "  Next steps:"
echo "  1. Set up Supabase project at https://supabase.com"
echo "  2. Run supabase/schema.sql in the SQL Editor"
echo "  3. Enable Google OAuth in Authentication > Providers"
echo "  4. Fill in apps/web/.env.local"
echo "  5. Run: npm run dev:web"
echo "  6. Open: http://localhost:3000"
echo ""
echo "  Test endpoints:"
echo "  - Health:  http://localhost:3000/api/health"
echo "  - Tests:   http://localhost:3000/api/test"
echo ""
