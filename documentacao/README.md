# Documentacao Completa - FinanceFlow OS

Sistema de gestao financeira e ordens de servico para assistencias tecnicas e lojas de informatica.

**Projeto:** FINANCEIRO-INOVA (FinanceFlow OS)
**Empresa:** Inova Informatica
**Stack:** React 19 + Express.js + SQLite
**Status:** Em desenvolvimento - preparando para publicacao online

---

## Indice

| Secao | Descricao |
|-------|-----------|
| [01 - Visao Geral](01-visao-geral/) | Descricao do projeto, tecnologias e glossario |
| [02 - Arquitetura](02-arquitetura/) | Mapa do projeto, camadas e fluxo de dados |
| [03 - Funcionalidades](03-funcionalidades/) | Tudo que ja funciona, autenticacao e integracoes |
| [04 - Frontend](04-frontend/) | Componentes, estado, navegacao e servico API |
| [05 - Backend](05-backend/) | Estrutura do servidor, endpoints e validacao |
| [06 - Banco de Dados](06-banco-de-dados/) | Esquema, relacionamentos, seed e migracao |
| [07 - Melhorias Pendentes](07-melhorias-pendentes/) | Divida tecnica, roadmap e checklist pre-producao |
| [08 - Deploy](08-deploy/) | Ambiente local, build, deploy e variaveis |
| [09 - Contribuicao](09-contribuicao/) | Padroes de codigo e fluxo Git |

---

## Resumo Tecnico

| Item | Valor |
|------|-------|
| Frontend | React 19 + TypeScript + Vite 6 + Tailwind CSS 4 |
| Backend | Express.js 4 + better-sqlite3 |
| Autenticacao | JWT + bcryptjs + rate limiting |
| Validacao | Zod 4 |
| Banco de Dados | SQLite (migracao para PostgreSQL planejada) |
| Tabelas | 14 |
| Endpoints API | 50+ |
| Componentes React | 53+ |

---

## Como Usar Esta Documentacao

1. **Novo no projeto?** Comece por [01 - Visao Geral](01-visao-geral/DESCRICAO-PROJETO.md)
2. **Quer entender a arquitetura?** Veja [02 - Arquitetura](02-arquitetura/MAPA-PROJETO.md)
3. **Vai desenvolver?** Leia [04 - Frontend](04-frontend/) e [05 - Backend](05-backend/)
4. **Vai publicar?** Siga [07 - Checklist](07-melhorias-pendentes/CHECKLIST-PRE-PRODUCAO.md) e [08 - Deploy](08-deploy/)

> Ultima atualizacao: 2026-03-28
