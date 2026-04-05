#!/bin/bash
# ============================================================
# Agent007 - Pre-Launch Checklist
# Run this before deploying to production
# ============================================================

echo ""
echo "=========================================="
echo "  Agent007 - Pre-Launch Checklist"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'
PASS=0
FAIL=0
WARN=0

pass() { echo -e "  ${GREEN}[PASS]${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}[FAIL]${NC} $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${YELLOW}[WARN]${NC} $1"; WARN=$((WARN+1)); }

# --- BUILD ---
echo "BUILD"
echo "-----"
npx turbo build --filter=web 2>/dev/null | grep -q "1 successful" && pass "Web build succeeds" || fail "Web build fails"
echo ""

# --- SECURITY ---
echo "SECURITY"
echo "--------"

# Check for hardcoded secrets
if grep -r "sk-ant-" apps/ packages/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | head -1 | grep -q .; then
  fail "Hardcoded Anthropic API key found in source"
else
  pass "No hardcoded API keys in source"
fi

if grep -r "eyJ" apps/ packages/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | head -1 | grep -q .; then
  warn "Possible JWT/token found in source code"
else
  pass "No JWT tokens in source"
fi

# Check .gitignore
if grep -q ".env.local" .gitignore 2>/dev/null; then
  pass ".env.local is in .gitignore"
else
  fail ".env.local NOT in .gitignore - secrets may be committed!"
fi

# Check encryption implementation
if grep -q "aes-256-gcm" apps/web/src/lib/encryption.ts 2>/dev/null; then
  pass "AES-256-GCM encryption implemented"
else
  fail "Encryption not using AES-256-GCM"
fi

# Check RLS
if grep -q "ENABLE ROW LEVEL SECURITY" supabase/schema.sql 2>/dev/null; then
  TABLES_WITH_RLS=$(grep -c "ENABLE ROW LEVEL SECURITY" supabase/schema.sql)
  pass "RLS enabled on ${TABLES_WITH_RLS} tables"
else
  fail "No RLS policies found"
fi

# Check rate limiting
if grep -q "check_rate_limit" apps/web/src/app/api/chat/route.ts 2>/dev/null; then
  pass "Rate limiting on chat endpoint"
else
  fail "No rate limiting on chat endpoint"
fi

echo ""

# --- PAGES ---
echo "PAGES & ROUTES"
echo "--------------"

PAGES=(
  "apps/web/src/app/page.tsx:Landing Page"
  "apps/web/src/app/login/page.tsx:Login Page"
  "apps/web/src/app/dashboard/page.tsx:Dashboard"
  "apps/web/src/app/dashboard/chat/page.tsx:Chat UI"
  "apps/web/src/app/dashboard/monitoring/page.tsx:Monitoring"
  "apps/web/src/app/dashboard/settings/page.tsx:Settings"
  "apps/web/src/app/not-found.tsx:404 Page"
)

for entry in "${PAGES[@]}"; do
  FILE="${entry%%:*}"
  NAME="${entry##*:}"
  [ -f "$FILE" ] && pass "$NAME ($FILE)" || fail "$NAME missing"
done

echo ""

# --- API ROUTES ---
echo "API ROUTES"
echo "----------"

ROUTES=(
  "apps/web/src/app/api/chat/route.ts:Chat API"
  "apps/web/src/app/api/credentials/route.ts:Credentials API"
  "apps/web/src/app/api/health/route.ts:Health Check"
  "apps/web/src/app/api/webhooks/telegram/route.ts:Telegram Webhook"
  "apps/web/src/app/api/webhooks/n8n/route.ts:n8n Webhook"
)

for entry in "${ROUTES[@]}"; do
  FILE="${entry%%:*}"
  NAME="${entry##*:}"
  [ -f "$FILE" ] && pass "$NAME" || fail "$NAME missing"
done

echo ""

# --- AI TOOLS ---
echo "AI AGENT TOOLS"
echo "--------------"

TOOLS=("listWorkflows" "getWorkflowDetails" "activateWorkflow" "deactivateWorkflow" "executeWorkflow" "getRecentExecutions" "getExecutionDetails" "checkHealth")
for tool_name in "${TOOLS[@]}"; do
  if grep -q "$tool_name" apps/web/src/lib/ai/tools.ts 2>/dev/null; then
    pass "Tool: $tool_name"
  else
    fail "Tool: $tool_name missing"
  fi
done

echo ""

# --- MOBILE ---
echo "MOBILE APP"
echo "----------"

MOBILE_FILES=(
  "apps/mobile/app.json:Expo config"
  "apps/mobile/eas.json:EAS config"
  "apps/mobile/src/app/_layout.tsx:Root layout"
  "apps/mobile/src/app/chat.tsx:Chat screen"
  "apps/mobile/src/app/monitoring.tsx:Monitoring screen"
  "apps/mobile/src/app/settings.tsx:Settings screen"
  "apps/mobile/src/app/login.tsx:Login screen"
)

for entry in "${MOBILE_FILES[@]}"; do
  FILE="${entry%%:*}"
  NAME="${entry##*:}"
  [ -f "$FILE" ] && pass "$NAME" || warn "$NAME missing"
done

echo ""

# --- CI/CD ---
echo "CI/CD"
echo "-----"

[ -f ".github/workflows/deploy-web.yml" ] && pass "Web deploy workflow" || warn "Web deploy workflow missing"
[ -f ".github/workflows/build-mobile.yml" ] && pass "Mobile build workflow" || warn "Mobile build workflow missing"

echo ""

# --- SUMMARY ---
echo "=========================================="
echo "  RESULTS"
echo "=========================================="
echo -e "  ${GREEN}Passed: ${PASS}${NC}"
echo -e "  ${RED}Failed: ${FAIL}${NC}"
echo -e "  ${YELLOW}Warnings: ${WARN}${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}Ready for test launch!${NC}"
else
  echo -e "  ${RED}Fix ${FAIL} failure(s) before launching.${NC}"
fi
echo ""
