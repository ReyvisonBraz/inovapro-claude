#!/usr/bin/env bash
# ============================================================
# INOVA PRO — Deploy manual para Google Cloud Run
# ============================================================
# Pré-requisitos:
#   1. gcloud CLI instalado e configurado
#   2. gcloud auth login (ou usar service account)
#   3. Projeto GCP criado: gcloud projects create inovapro --name="INOVA PRO"
#   4. APIs habilitadas:
#        gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
#   5. Artifact Registry criado:
#        gcloud artifacts repositories create cloud-run-source --repository-format=docker --location=us-central1
# ============================================================

set -euo pipefail

# ─── Configurações (editáveis) ───
PROJECT_ID="inovapro"
SERVICE_NAME="inovapro-api"
REGION="us-central1"

# ─── Variáveis de ambiente (obrigatórias) ───
# Defina no seu shell ou num .env.production antes de rodar
: "${DATABASE_URL:?Erro: DATABASE_URL não definida}"
: "${JWT_SECRET:?Erro: JWT_SECRET não definida}"
: "${APP_URL:?Erro: APP_URL não definida (ex: https://inovapro.vercel.app)}"

echo "=== INOVA PRO — Deploy Cloud Run ==="
echo "Projeto: $PROJECT_ID"
echo "Serviço: $SERVICE_NAME"
echo "Região: $REGION"
echo ""

# 1. Build da imagem
echo "[1/3] Build da imagem Docker..."
gcloud builds submit \
  --project="$PROJECT_ID" \
  --config=cloudbuild.yaml \
  --substitutions=\
_SERVICE_NAME="$SERVICE_NAME",\
_REGION="$REGION",\
_DATABASE_URL="$DATABASE_URL",\
_JWT_SECRET="$JWT_SECRET",\
_APP_URL="$APP_URL" \
  --timeout=900s

# 2. Verificar deploy
echo ""
echo "[2/3] Verificando deploy..."
sleep 5
CLOUD_RUN_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format='value(status.url)')

echo "URL do Cloud Run: $CLOUD_RUN_URL"

# 3. Testar health check
echo ""
echo "[3/3] Testando health check..."
sleep 3
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CLOUD_RUN_URL/health")
if [ "$HEALTH_STATUS" = "200" ]; then
  echo "✅ Health check OK (HTTP $HEALTH_STATUS)"
else
  echo "❌ Health check falhou (HTTP $HEALTH_STATUS)"
  exit 1
fi

echo ""
echo "=== Deploy concluído! ==="
echo "Backend:  $CLOUD_RUN_URL"
echo ""
echo "Próximo passo: atualizar VITE_API_URL no Vercel para:"
echo "  $CLOUD_RUN_URL"
