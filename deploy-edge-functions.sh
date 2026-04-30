#!/bin/bash
# Deploy script para Supabase Edge Functions

set -e

PROJECT_REF="dqpxwyixiluiyfjxakge"
JWT_SECRET="cda85d85dd2a068fcfb9b76223b511dd3b22299db35b2c545e2d214dc05a4484"

echo "==================================="
echo "Supabase Edge Functions Deploy"
echo "==================================="

# Check if supabase is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não está instalado."
    echo ""
    echo "Instale com:"
    echo "  curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz -o /tmp/supabase.tar.gz"
    echo "  tar -xzf /tmp/supabase.tar.gz -C /tmp"
    echo "  chmod +x /tmp/supabase"
    echo "  sudo mv /tmp/supabase /usr/local/bin/supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"

# Check if logged in
echo ""
echo "Verificando login..."
supabase projects list &> /dev/null || {
    echo "❌ Não está logado. Execute: supabase login"
    exit 1
}
echo "✅ Logado no Supabase"

# Link project
echo ""
echo "Linkando projeto..."
cd supabase
supabase link --project-ref $PROJECT_REF --no-prompt 2>/dev/null || true

# Set secrets
echo ""
echo "Configurando secrets..."
supabase secrets set JWT_SECRET="$JWT_SECRET" 2>/dev/null || true

# Deploy all functions
echo ""
echo "Deployando functions..."
supabase functions deploy --no-verify-jwt

echo ""
echo "==================================="
echo "✅ Deploy concluído!"
echo "==================================="
echo ""
echo "URLs das functions:"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/health"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/login"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/categories"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/customers"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/transactions"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/stats"
echo ""