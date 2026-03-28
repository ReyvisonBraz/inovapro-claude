# Migracao para PostgreSQL

## Status: Planejado (Fase 5)

## Por Que Migrar?

| SQLite (Atual) | PostgreSQL (Futuro) |
|----------------|---------------------|
| Arquivo local | Banco na nuvem |
| Acesso somente local | Acesso de qualquer lugar |
| Sem controle de acesso no banco | Row Level Security (RLS) |
| Limitado a um servidor | Escalavel |
| Sem backup automatico | Backup automatico (Supabase) |
| Base64 para fotos | Supabase Storage |

## Provedor Planejado: Supabase

- **Regiao:** sa-east-1 (Sao Paulo)
- **Tipo:** PostgreSQL gerenciado
- **Adicional:** Storage, Auth, Edge Functions, Realtime

## Preparacao Existente

### Prisma Schema (prisma/schema.prisma)

O schema Prisma ja esta preparado com o datasource para PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Supabase Standby (src/lib/supabase-standby.ts)

Arquivo preparado para inicializar o cliente Supabase quando necessario.

### Variavel de Ambiente

```
DATABASE_URL=postgresql://user:password@host:5432/database
```

Ja comentada no .env como preparacao.

## Diferencas SQLite → PostgreSQL

| SQLite | PostgreSQL | Acao Necessaria |
|--------|------------|-----------------|
| REAL | DECIMAL(10,2) | Usar tipo monetario preciso |
| TEXT (datetime) | TIMESTAMPTZ | Usar timestamps com timezone |
| INTEGER (boolean) | BOOLEAN | Converter showWarnings, isDefault |
| AUTOINCREMENT | SERIAL | Tipo nativo para auto-incremento |
| TEXT (JSON) | JSONB | Tipo nativo para JSON (partsUsed, etc.) |
| CHECK (id = 1) | Constraint SQL | Manter logica de singleton |
| WAL mode | Nao aplicavel | PostgreSQL tem MVCC nativo |

## Passos de Migracao

### 1. Configurar Supabase

```bash
# Criar projeto no Supabase Dashboard
# Obter DATABASE_URL
# Configurar no .env
```

### 2. Ajustar Prisma Schema

- Mapear todas as 14 tabelas como models Prisma
- Definir relacoes com @relation
- Usar tipos corretos (Decimal, DateTime, Boolean, Json)

### 3. Gerar Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Migrar Dados

- Exportar dados do SQLite
- Transformar tipos (INTEGER → BOOLEAN, TEXT → JSONB)
- Importar no PostgreSQL

### 5. Atualizar Backend

- Substituir better-sqlite3 por Prisma Client
- Atualizar queries SQL diretas para Prisma queries
- Atualizar helpers (paginacao, auditoria)

### 6. Atualizar Armazenamento de Fotos

- Substituir base64 por Supabase Storage
- Subir fotos como arquivos
- Salvar URL publica no banco

### 7. Configurar RLS (Row Level Security)

- Politicas de acesso por role
- Owners podem tudo
- Managers/employees limitados pelas permissoes

## Estimativa de Impacto

| Arquivo | Mudancas Necessarias |
|---------|---------------------|
| server/database.ts | Substituir por Prisma Client |
| server/seed.ts | Usar Prisma migrations |
| server/helpers.ts | Usar Prisma para paginacao |
| server/routes/*.ts | Trocar SQL direto por Prisma |
| .env | Adicionar DATABASE_URL |

## Riscos

- Dados monetarios como REAL podem perder precisao (usar DECIMAL)
- Campos JSON precisam ser parseados corretamente
- Fotos em base64 sao grandes (migrar para Storage)
- Queries SQL customizadas podem precisar ajustes
- Performance local pode ser afetada pela latencia de rede
