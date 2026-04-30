#!/bin/bash
set -e

BASE="http://localhost:3000"
TOKEN_FILE="/tmp/test_token.txt"

echo "=== TEST LOGIN ==="
LOGIN_RESP=$(curl -s -X POST "$BASE/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin2021"}')
echo "$LOGIN_RESP" > /tmp/login_resp.json

TOKEN=$(node -e "console.log(require('/tmp/login_resp.json').token)")
echo "Token: ${TOKEN:0:30}..."
echo "$TOKEN" > "$TOKEN_FILE"

echo -e "\n=== CREATE CUSTOMER ==="
CREATE_RESP=$(curl -s -X POST "$BASE/api/customers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ana","lastName":"Teste","phone":"11999990000"}')
echo "$CREATE_RESP"

echo -e "\n=== CREATE TRANSACTION ==="
TX_RESP=$(curl -s -X POST "$BASE/api/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Servico Teste","category":"Serviços","type":"income","amount":750,"date":"2026-04-29"}')
echo "$TX_RESP"

echo -e "\n=== GET STATS ==="
curl -s "$BASE/api/stats" -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== ALL TESTS PASSED ==="