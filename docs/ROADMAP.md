# Roadmap e Próximos Passos - FINANCEIRO INOVA

## 1. Status Atual: **90% (Fase de Transição Cloud & Refinamento de UI)**
O sistema está em fase final de **Transição para Arquitetura Cloud**. Atualmente operando com SQLite local para desenvolvimento ágil, mas com toda a estrutura de tipos, esquemas e serviços preparada para migração imediata para **Supabase (Banco de Dados)** e **Render (Hospedagem de Backend)**.

---

## 2. Próximos Passos (Roadmap de Migração)

### 2.1 Migração para Supabase (PostgreSQL)
- [x] Definição do Esquema Relacional (Prisma/SQL).
- [ ] Provisionar projeto no Supabase (Região: `sa-east-1`).
- [ ] Executar script de criação de tabelas (DDL) no SQL Editor do Supabase.
- [ ] Migrar dados existentes do SQLite para o PostgreSQL via script de importação.

### 2.2 Hospedagem no Render.com (Backend)
- [ ] Criar Web Service no Render conectado ao repositório GitHub.
- [ ] Configurar variáveis de ambiente (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
- [ ] Configurar o `start` script para rodar o servidor Express em produção.
- [ ] Habilitar HTTPS automático e monitoramento de saúde (Health Check).

### 2.3 Autenticação e Segurança
- [ ] Implementar **Supabase Auth** para substituir a autenticação local.
- [ ] Configurar **Row Level Security (RLS)** no Supabase para proteção direta no banco.
- [ ] Configurar políticas de acesso baseadas em `auth.uid()`.

### 2.4 Integrações Avançadas
- [ ] Configurar **Supabase Storage** para fotos de entrada de equipamentos (substituindo Base64).
- [ ] Implementar Webhooks para notificações em tempo real via Edge Functions.
- [ ] Integração com APIs de Terceiros (WhatsApp/SendPulse) via Server-side.

---

## 3. Melhorias de Produto (Novas Funcionalidades)
- **Módulo de Vendas Diretas:** Interface rápida para PDV (Ponto de Venda).
- **Gestão de Comissões:** Cálculo automático de comissões para técnicos e vendedores.
- **Integração com Bancos:** Conciliação bancária automática via Open Banking.
- **Relatórios Avançados:** Gráficos de lucratividade por técnico e por tipo de serviço.
- **App Mobile:** Versão nativa ou PWA otimizado para técnicos em campo.

---
**Versão:** 1.0.0
**Data:** Abril de 2026
