# Integracoes

## Google Gemini AI

**Status:** Configurado (opcional)

### Proposito
Analise tecnica assistida por IA em ordens de servico. O Gemini sugere diagnosticos e previsoes com base no problema relatado pelo cliente.

### Configuracao
- Variavel de ambiente: `GEMINI_API_KEY`
- SDK: `@google/genai` v1.45.0
- Chave injetada via Vite (`import.meta.env.VITE_GEMINI_API_KEY`)

### Uso
- Disponivel na tela de Ordens de Servico
- Tecnico descreve o problema
- IA sugere possivel diagnostico e previsao de analise

---

## WhatsApp (via SendPulse)

**Status:** Templates configurados, integracao parcial

### Proposito
Enviar notificacoes automaticas para clientes via WhatsApp:
- Cobrancas de pagamentos pendentes
- Atualizacoes de status de OS

### Configuracao (tabela settings)

| Campo | Descricao |
|-------|-----------|
| `whatsappBillingTemplate` | Template de mensagem de cobranca |
| `whatsappOSTemplate` | Template de mensagem de OS |
| `sendPulseClientId` | Client ID da API SendPulse |
| `sendPulseClientSecret` | Client Secret da API SendPulse |
| `sendPulseTemplateId` | ID do template aprovado no SendPulse |

### Fluxo
1. Admin configura credenciais SendPulse em Configuracoes > WhatsApp
2. Define templates de mensagem
3. Na tela de clientes, abre modal WhatsApp para enviar mensagem

---

## Telegram Bot

**Status:** Configurado, integracao parcial

### Proposito
Enviar notificacoes via Telegram (alternativa ao WhatsApp).

### Configuracao (tabela settings)

| Campo | Descricao |
|-------|-----------|
| `telegramBotToken` | Token do bot criado no @BotFather |
| `telegramChatId` | ID do chat/grupo para enviar mensagens |

---

## PIX e QR Code

**Status:** Implementado

### Proposito
Gerar QR code PIX nos recibos de pagamento para facilitar transferencias.

### Configuracao (tabela settings)

| Campo | Descricao |
|-------|-----------|
| `pixKey` | Chave PIX da empresa (CPF, CNPJ, email, telefone ou aleatoria) |
| `pixQrCode` | QR code PIX codificado (para exibicao no recibo) |

### Uso
- Biblioteca: `qrcode.react` v4.2.0
- QR code aparece nos recibos gerados
- Cliente escaneia com app do banco para pagar

---

## Impressao e Captura de Tela

**Status:** Implementado

### Proposito
Imprimir recibos, ordens de servico e gerar imagens para compartilhamento.

### Tecnologia
- `html2canvas` v1.4.1
- Captura componentes React como imagem
- Usado para print de OS e recibos

### Fluxo
1. Componente renderiza layout de impressao (PrintLayout)
2. html2canvas captura o HTML como canvas
3. Canvas convertido em imagem ou enviado para impressora

---

## Supabase (Futuro)

**Status:** Preparado, nao ativo

### Proposito
Migrar de SQLite local para PostgreSQL na nuvem (Supabase).

### Preparacao Existente
- Arquivo `src/lib/supabase-standby.ts` (standby)
- Schema Prisma em `prisma/schema.prisma` configurado para PostgreSQL
- Regiao planejada: `sa-east-1` (Sao Paulo)

### Beneficios Planejados
- Banco na nuvem (acesso de qualquer lugar)
- Row Level Security (RLS)
- Supabase Storage para fotos (substituir base64)
- Supabase Auth (opcao para substituir JWT customizado)
- Edge Functions para webhooks

---

## Resumo de Status das Integracoes

| Integracao | Status | Biblioteca |
|------------|--------|-----------|
| Google Gemini AI | Funcional (com API key) | @google/genai |
| WhatsApp/SendPulse | Templates prontos, envio parcial | - |
| Telegram | Configurado, envio parcial | - |
| PIX/QR Code | Funcional | qrcode.react |
| Impressao | Funcional | html2canvas |
| Supabase | Preparado (standby) | - |
