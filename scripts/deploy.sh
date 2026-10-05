#!/usr/bin/env bash
# Deploy LaunchKit VN lên Supabase cloud + Vercel.
# Yêu cầu biến môi trường (đặt trong môi trường, KHÔNG dán vào chat):
#   SUPABASE_ACCESS_TOKEN   token cá nhân Supabase (supabase.com/dashboard/account/tokens)
#   SUPABASE_PROJECT_REF    ví dụ: wbqfhbgmailujlwnxyax
#   SUPABASE_DB_PASSWORD    mật khẩu database của project
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#   VERCEL_TOKEN            token Vercel (vercel.com/account/tokens)
#   VERCEL_PROJECT_NAME     (tuỳ chọn, mặc định launchkit-vn)
#   MOCK_PAYMENT_WEBHOOK_SECRET (tuỳ chọn, sẽ tự sinh nếu thiếu)
set -euo pipefail
cd "$(dirname "$0")/.."

: "${SUPABASE_ACCESS_TOKEN:?Thiếu SUPABASE_ACCESS_TOKEN}"
: "${SUPABASE_PROJECT_REF:?Thiếu SUPABASE_PROJECT_REF}"
: "${SUPABASE_DB_PASSWORD:?Thiếu SUPABASE_DB_PASSWORD}"
: "${NEXT_PUBLIC_SUPABASE_URL:?Thiếu NEXT_PUBLIC_SUPABASE_URL}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Thiếu SUPABASE_SERVICE_ROLE_KEY}"
: "${VERCEL_TOKEN:?Thiếu VERCEL_TOKEN}"
PROJECT_NAME="${VERCEL_PROJECT_NAME:-launchkit-vn}"
MOCK_SECRET="${MOCK_PAYMENT_WEBHOOK_SECRET:-$(openssl rand -hex 24)}"

echo "▶ 1/4 Supabase: link + push migrations"
supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" >/dev/null
supabase db push --password "$SUPABASE_DB_PASSWORD"

echo "▶ 2/4 Supabase: seed catalog + users"
DB_URL="postgresql://postgres.${SUPABASE_PROJECT_REF}:${SUPABASE_DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql >/dev/null || psql "postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres" -v ON_ERROR_STOP=1 -f supabase/seed.sql >/dev/null
NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" pnpm seed:users

echo "▶ 3/4 Vercel: link project + env"
npx vercel@latest link --yes --project "$PROJECT_NAME" --token "$VERCEL_TOKEN" >/dev/null
for pair in \
  "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" \
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
  "MOCK_PAYMENT_WEBHOOK_SECRET=$MOCK_SECRET" \
  "AI_PROVIDER=mock" \
  "NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false"; do
  key="${pair%%=*}"; val="${pair#*=}"
  npx vercel@latest env rm "$key" production --yes --token "$VERCEL_TOKEN" >/dev/null 2>&1 || true
  printf '%s' "$val" | npx vercel@latest env add "$key" production --token "$VERCEL_TOKEN" >/dev/null
done

echo "▶ 4/4 Vercel: deploy production"
URL=$(npx vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN" 2>/dev/null | tail -1)
npx vercel@latest env rm NEXT_PUBLIC_APP_URL production --yes --token "$VERCEL_TOKEN" >/dev/null 2>&1 || true
printf '%s' "$URL" | npx vercel@latest env add NEXT_PUBLIC_APP_URL production --token "$VERCEL_TOKEN" >/dev/null
# Deploy lại để NEXT_PUBLIC_APP_URL được inline vào bundle
URL=$(npx vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN" 2>/dev/null | tail -1)

echo
echo "✅ Deploy xong: $URL"
echo "Việc còn lại trên Supabase Dashboard → Authentication → URL Configuration:"
echo "  Site URL: $URL"
echo "  Redirect URLs: $URL/auth/callback, $URL/**"
