# Observabilidade do INOVA PRO

## O que é registrado

### Erros técnicos

Persistidos em `SystemError` quando ocorrer:

- erro HTTP 5xx no servidor;
- conflito HTTP 409 relevante;
- falha de rede no navegador;
- erro global JavaScript ou promessa rejeitada sem tratamento;
- falha de renderização capturada pelo `ErrorBoundary`.

Cada evento pode conter código `ERR-*`, `requestId`, origem, severidade, operação,
rota, método, status HTTP, usuário, mensagem e stack. Apenas o proprietário pode
consultar ou marcar eventos como resolvidos em **Configurações > Erros**.

Erros esperados de validação, autenticação, permissão e cadastros duplicados não
entram no painel técnico para evitar ruído. Eles continuam sendo informados ao
usuário na interface.

### Auditoria de negócio

Persistida em `AuditLog` para criação, alteração e exclusão de:

- ordens de serviço e seus status;
- clientes;
- transações e pagamentos;
- itens e ajustes de estoque;
- usuários e configurações;
- categorias, marcas, modelos e tipos de equipamento.

A auditoria registra usuário, ação, entidade, identificador, horário, rota e
`requestId`. Senhas, tokens, segredos, CPF, fotos e conteúdo base64 são mascarados.

## Comportamento para o usuário

- Falhas técnicas rastreáveis exibem um código `ERR-*` quando a interface possui
  contexto para fazê-lo.
- O `ErrorBoundary` não afirma que alguém foi avisado; informa apenas o que foi
  realmente registrado e oferece recuperação.
- O botão de atualização consulta o service worker de verdade e não simula `git pull`.

## Limitações conhecidas

- Se o próprio banco estiver indisponível, o erro não poderá ser salvo em
  `SystemError`; ele continuará disponível nos logs da plataforma/servidor.
- Alertas externos ainda exigem configurar um provedor (por exemplo, Sentry) e
  suas credenciais. Até isso ocorrer, o sistema não afirma que a equipe foi avisada.
- Stacks do frontend apontam para o bundle de produção. Um provedor com source maps
  melhora a localização exata no código-fonte.

## Publicação

Antes de publicar, aplicar as migrations:

```bash
npx prisma migrate deploy
```

Depois, publicar normalmente e validar **Configurações > Erros** e
**Configurações > Auditoria** com uma operação de teste controlada.
