#!/usr/bin/env bash
# ============================================================================
# Banco de integração descartável (local). Sobe um Postgres em container,
# aplica migrations, seeda o admin e roda a suíte de integração (Postgres real).
# Uso: npm run test:integration:local
# Pode-se sobrescrever com TEST_DB_PORT (default 5432) e DATABASE_URL.
# ============================================================================
set -euo pipefail

CONTAINER="${INOVA_TEST_DB_CONTAINER:-inova-pro-it-db}"
TEST_DB_PORT="${TEST_DB_PORT:-5432}"
TEST_DB_URL="${DATABASE_URL:-postgresql://ci:ci@localhost:${TEST_DB_PORT}/ci}"

if ! command -v docker >/dev/null 2>&1; then
  echo "::error:: docker não encontrado. Instale/abra o Docker Desktop." >&2
  exit 1
fi

cleanup() {
  echo "→ Parando e removendo o container de teste (${CONTAINER})…"
  docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "→ Subindo Postgres de teste (porta ${TEST_DB_PORT})…"
docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
docker run -d --name "${CONTAINER}" \
  -e POSTGRES_USER=ci -e POSTGRES_PASSWORD=ci -e POSTGRES_DB=ci \
  -p "${TEST_DB_PORT}:5432" \
  postgres:16-alpine >/dev/null

echo "→ Aguardando readiness…"
for i in $(seq 1 30); do
  if docker exec "${CONTAINER}" pg_isready -U ci -d ci >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "${CONTAINER}" pg_isready -U ci -d ci >/dev/null 2>&1 || {
  echo "::error:: Postgres de teste não respondeu." >&2
  exit 1
}

export DATABASE_URL="${TEST_DB_URL}"

echo "→ Aplicando migrations…"
npx prisma migrate deploy

echo "→ Seed do admin de teste…"
SEED_ADMIN_PASSWORD="admin2021" npx tsx scripts/seed-admin.ts

echo "→ Rodando suíte de integração…"
npm run test:integration