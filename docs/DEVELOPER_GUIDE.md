# Guia do Desenvolvedor - FINANCEIRO INOVA

## 1. Configuração do Ambiente
O projeto utiliza **Vite** para o frontend e **Express** para o backend.

### 1.1 Pré-requisitos
- Node.js 18+
- npm ou yarn

### 1.2 Instalação
```bash
npm install
```

### 1.3 Execução em Desenvolvimento
```bash
npm run dev
```

---

## 2. Padrões de Código

### 2.1 TypeScript
- Use interfaces globais em `src/types.ts`.
- Evite o uso de `any`.
- Tipagem forte em todos os hooks e componentes.

### 2.2 Componentização
- Componentes de UI devem ser puros e reutilizáveis (em `src/components/ui`).
- Lógica complexa deve ser movida para hooks customizados.
- Use `lucide-react` para ícones.

### 2.3 Estado Global (Zustand)
- Segmentar o estado em diferentes stores para evitar re-renderizações desnecessárias.
- Exemplo: `useModalStore` apenas para controle de modais.

---

## 3. Banco de Dados (SQLite)
O banco de dados é o arquivo `finance.db` na raiz do projeto.
Para visualizar os dados localmente, você pode usar ferramentas como **DB Browser for SQLite** ou extensões do VS Code.

### 3.1 Esquema e Migrações
O esquema é definido e inicializado no `server.ts`. Migrações simples são feitas via `ALTER TABLE` no início do servidor.

---

## 4. API REST
As rotas da API estão centralizadas no `server.ts` sob o prefixo `/api`.
Todas as rotas de escrita (POST, PUT, DELETE) devem gerar logs de auditoria.

---

## 5. Débitos Técnicos e Manutenção
- **Arquivos Grandes:** Evite que componentes ou hooks cresçam demais. Se um arquivo passar de 500 linhas, considere refatorar.
- **Performance:** Use `lazy` loading para páginas e `memo` para componentes pesados se necessário.
- **Acessibilidade:** Garanta que o sistema seja utilizável via teclado e que o redimensionamento de fontes funcione corretamente.

---
**Versão:** 1.0.0
**Data:** Abril de 2026
