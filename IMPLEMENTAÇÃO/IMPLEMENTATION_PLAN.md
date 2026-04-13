# PLANO DE IMPLEMENTAÇÃO - FINANCEIRO INOVA

**Versão:** 1.0  
**Data de Criação:** 2026-04-13  
**Status:** Aprovado para execução  
**Estimativa Total:** 16-24 horas

---

## FILOSOFIA DO PLANO

```
Princípio: "Cada passo pequeno e verificado é melhor que passos grandes incertos"
Dependência: Cada fase só começa quando a anterior estiver VERIFICADA
Rollback: Se algo falhar, voltar e corrigir antes de avançar
Verificação: Ao final de cada fase, executar testes de regressão
```

---

## ÍNDICE

1. [FASE 0: Preparação e Backup](#fase-0--preparação-e-backup)
2. [FASE 1: Segurança Fundamental](#fase-1--segurança-fundamental)
3. [FASE 2: Qualidade de Código](#fase-2--qualidade-de-código)
4. [FASE 3: Alinhamento do Banco de Dados](#fase-3--alinhamento-do-banco-de-dados)
5. [FASE 4: Frontend - Melhorias](#fase-4--frontend--melhorias)
6. [FASE 5: Integrações](#fase-5--integrações)
7. [FASE 6: Testes e Validação](#fase-6--testes-e-validação)
8. [FASE 7: Documentação](#fase-7--documentação)
9. [FASE 8: Preparação para Migração](#fase-8--preparação-para-migração)

---

## FASE 0: PREPARAÇÃO E BACKUP

**Responsável:** Este plano  
**Dependência:** Nenhuma  
**Tempo Estimado:** 30 minutos

### 0.1 - Verificar Estrutura de Pastas

```
FINANCEIRO-INOVA/
├── docs/                    # Já existe
├── backups/                 # NOVO - Para backups manuais
│   └── YYYY-MM-DD/         # Backup antes de cada fase
├── src.refactor/           # NOVO - Código legado para referência
├── scripts/                 # NOVO - Scripts utilitários
├── IMPLEMENTAÇÃO/           # Este plano
│   ├── IMPLEMENTATION_PLAN.md
│   └── ...
└── src/
```

### 0.2 - Comandos de Verificação Inicial

```bash
# Verificar que o projeto compila
npm run lint

# Verificar que o projeto inicia
npm run dev

# Verificar estado do banco
sqlite3 finance.db ".tables"
sqlite3 finance.db "SELECT COUNT(*) FROM users;"
```

### 0.3 - Checklist de Verificação

- [ ] `npm install` foi executado sem erros
- [ ] `npm run lint` retorna 0 errors
- [ ] `npm run dev` inicia o servidor na porta 5173
- [ ] Banco SQLite contém dados (users, settings, etc)
- [ ] Backup do `finance.db` foi criado
- [ ] Backup do `server.ts` original foi criado
- [ ] Backup do `src/` completo foi criado

### Critério de Sucesso

```bash
# Este comando deve retornar "0" erros
npm run lint && echo "FASE 0: VERIFICADA COM SUCESSO"
```

---

## FASE 1: SEGURANÇA FUNDAMENTAL

**Responsável:** Este plano  
**Dependência:** FASE 0  
**Tempo Estimado:** 4-6 horas  
**Criticidade:** 🔴 CRÍTICO

### Visão Geral

Esta fase corrige TODOS os problemas de segurança identificados. Sem ela, o sistema é vulnerável a ataques.

### 1.1 - Corrigir SENHAS (CRÍTICO)

#### 1.1.1 - Instalar Dependências

```bash
npm install bcryptjs jsonwebtoken express-rate-limit cors
npm install -D @types/bcryptjs @types/jsonwebtoken @types/cors
```

#### 1.1.2 - Script de Migração de Senhas

**Arquivo:** `scripts/migratePasswords.ts`

```typescript
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

const db = new Database('finance.db')

const users = db.prepare('SELECT id, password FROM users').all() as any[]

for (const user of users) {
  // Se a senha já é um hash bcrypt (começa com $2), pular
  if (user.password.startsWith('$2')) {
    console.log(`Usuário ${user.id}: senha já é hash, pulando`)
    continue
  }
  
  // Fazer hash da senha atual
  const hashedPassword = bcrypt.hashSync(user.password, 10)
  
  // Atualizar no banco
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id)
  console.log(`Usuário ${user.id}: senha migrada com sucesso`)
}

console.log('Migração de senhas concluída')
```

#### 1.1.3 - Modificar server.ts - Login

**ANTES (VULNERÁVEL):**
```typescript
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  res.json(user)
})
```

**DEPOIS (SEGURO):**
```typescript
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e senha são obrigatórios' })
  }
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }
  
  const passwordMatch = await bcrypt.compare(password, user.password)
  
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }
  
  // Gerar JWT
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    { expiresIn: '7d' }
  )
  
  // Retornar usuário sem senha
  const { password: _, ...userWithoutPassword } = user
  res.json({ user: userWithoutPassword, token })
})
```

#### 1.1.4 - Modificar server.ts - Criar/Atualizar Usuário

**Função helper para hash:**
```typescript
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10)
}
```

**Ao criar usuário:**
```typescript
// POST /api/users
const hashedPassword = await hashPassword(password)
db.prepare('INSERT INTO users (...) VALUES (...)').run(...)
```

**Ao atualizar senha:**
```typescript
// PUT /api/users/:id (com password no body)
if (password) {
  const hashedPassword = await hashPassword(password)
  // usar hashedPassword no update
}
```

### 1.2 - Implementar AUTENTICAÇÃO (JWT)

#### 1.2.1 - Middleware de Autenticação

**Arquivo:** `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    userId: number
    username: string
    role: string
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret-change-in-production'
    ) as AuthRequest['user']
    
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expirado' })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Token inválido' })
    }
    res.status(401).json({ error: 'Falha na autenticação' })
  }
}
```

#### 1.2.2 - Middleware de Roles

**Arquivo:** `src/middleware/roles.ts`

```typescript
import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

type Role = 'owner' | 'manager' | 'employee'

export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' })
    }
    
    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({ error: 'Acesso proibido para este perfil' })
    }
    
    next()
  }
}
```

#### 1.2.3 - Tabela de Permissões por Role

| Recurso | AÇÃO | Owner | Manager | Employee |
|---------|------|-------|---------|----------|
| **Transactions** | Create | ✅ | ✅ | ✅ |
| | Read | ✅ | ✅ | ✅ |
| | Update | ✅ | ✅ | ❌ |
| | Delete | ✅ | ✅ | ❌ |
| **Customers** | Create | ✅ | ✅ | ✅ |
| | Read | ✅ | ✅ | ✅ |
| | Update | ✅ | ✅ | ✅ |
| | Delete | ✅ | ✅ | ❌ |
| **Payments** | Create | ✅ | ✅ | ✅ |
| | Read | ✅ | ✅ | ✅ |
| | Update | ✅ | ✅ | ✅ |
| | Delete | ✅ | ✅ | ❌ |
| **Service Orders** | Create | ✅ | ✅ | ✅ |
| | Read | ✅ | ✅ | ✅ |
| | Update | ✅ | ✅ | ✅ |
| | Delete | ✅ | ✅ | ❌ |
| **Inventory** | Create | ✅ | ✅ | ❌ |
| | Read | ✅ | ✅ | ✅ |
| | Update | ✅ | ✅ | ❌ |
| | Delete | ✅ | ❌ | ❌ |
| **Users** | Create | ✅ | ❌ | ❌ |
| | Read | ✅ | ❌ | ❌ |
| | Update | ✅ | ❌ | ❌ |
| | Delete | ✅ | ❌ | ❌ |
| **Audit Logs** | Read | ✅ | ✅ | ❌ |
| **Settings** | Read | ✅ | ✅ | ✅ |
| | Update | ✅ | ❌ | ❌ |

#### 1.2.4 - Implementar Endpoints de Autenticação

```typescript
// POST /api/auth/login - Já existe, refatorado na seção 1.1.3

// POST /api/auth/logout - Client-side apenas (invalidar token requer blacklist)
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  // O client deve remover o token do localStorage
  // O server pode implementar blacklist se necessário
  res.json({ message: 'Logout realizado com sucesso' })
})

// GET /api/auth/me - Retorna usuário atual
app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, username, name, role, permissions FROM users WHERE id = ?')
    .get(req.user!.userId)
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }
  
  res.json(user)
})

// PUT /api/auth/change-password - Muda senha do próprio usuário
app.put('/api/auth/change-password', authMiddleware, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Senhas obrigatórias' })
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' })
  }
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as any
  
  const match = await bcrypt.compare(currentPassword, user.password)
  if (!match) {
    return res.status(401).json({ error: 'Senha atual incorreta' })
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id)
  
  res.json({ message: 'Senha alterada com sucesso' })
})
```

#### 1.2.5 - Proteger TODOS os Endpoints

```typescript
// Aplicar authMiddleware em todas as rotas /api EXCETO /api/login e /api/public
app.use('/api', authMiddleware)

// Rotas públicas (sem autenticação)
app.post('/api/login', loginHandler) // Sem authMiddleware!
app.get('/api/public/info', publicInfoHandler) // Se houver
```

#### 1.2.6 - Atualizar createdBy/updatedBy nos Handlers

```typescript
// Em TODOS os handlers que criam/atualizam registros:

// ANTES:
db.prepare('INSERT INTO transactions (...) VALUES (?, ?, 1)')
  .run(description, amount)

// DEPOIS:
db.prepare('INSERT INTO transactions (...) VALUES (?, ?, ?)')
  .run(description, amount, req.user!.userId)
```

### 1.3 - Corrigir SQL INJECTION

#### 1.3.1 - Whitelist de Colunas para ORDER BY

```typescript
// Constantes de colunas permitidas por tabela
const ALLOWED_SORT_COLUMNS = {
  transactions: ['id', 'description', 'category', 'type', 'amount', 'date', 'createdAt'],
  customers: ['id', 'firstName', 'lastName', 'phone', 'createdAt'],
  service_orders: ['id', 'status', 'priority', 'entryDate', 'createdAt'],
  client_payments: ['id', 'totalAmount', 'paidAmount', 'purchaseDate', 'dueDate', 'status'],
  inventory: ['id', 'name', 'category', 'quantity', 'unitPrice'],
  users: ['id', 'username', 'name', 'role', 'createdAt']
}

const validateSortParams = (sortBy: string, allowedColumns: string[], defaultColumn: string = 'id'): string => {
  if (allowedColumns.includes(sortBy)) {
    return sortBy
  }
  return defaultColumn
}

const validateOrder = (order: string): 'ASC' | 'DESC' => {
  return order.toLowerCase() === 'asc' ? 'ASC' : 'DESC'
}
```

#### 1.3.2 - Query Builder Seguro (Helper)

```typescript
// Helper para queries com ORDER BY seguro
const buildPaginatedQuery = (
  table: string,
  options: {
    page: number,
    limit: number,
    where?: string,
    whereParams?: any[],
    orderBy?: string,
    order?: 'ASC' | 'DESC',
    allowedSortColumns: string[]
  }
) => {
  const { page, limit, where, whereParams = [], orderBy = 'id', order = 'DESC', allowedSortColumns } = options
  
  const safeOrderBy = validateSortParams(orderBy, allowedSortColumns)
  const safeOrder = validateOrder(order)
  const offset = (page - 1) * limit
  
  let query = `SELECT * FROM ${table}`
  let countQuery = `SELECT COUNT(*) as total FROM ${table}`
  
  const params: any[] = []
  
  if (where) {
    query += ` WHERE ${where}`
    countQuery += ` WHERE ${where}`
    params.push(...whereParams)
  }
  
  query += ` ORDER BY ${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?`
  
  const total = db.prepare(countQuery).get(...params) as { total: number }
  const data = db.prepare(query).all(...params, limit, offset)
  
  return {
    data,
    meta: {
      total: total.total,
      page,
      limit,
      totalPages: Math.ceil(total.total / limit)
    }
  }
}
```

### 1.4 - Configurar CORS

```typescript
import cors from 'cors'

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### 1.5 - Adicionar Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

// Limitador para login (prevenir brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
})

app.post('/api/login', loginLimiter, loginHandler)

// Limitador geral para API
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: { error: 'Muitas requisições. Diminua o ritmo.' }
})

app.use('/api', apiLimiter)
```

### 1.6 - Variáveis de Ambiente

**Arquivo:** `.env`

```env
# Segurança - OBRIGATÓRIO ALTERAR EM PRODUÇÃO
JWT_SECRET=seu-secret-super-secreto-mude-isso
JWT_EXPIRES_IN=7d

# Frontend URL para CORS
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_PATH=./finance.db
```

### Checklist de Verificação - FASE 1

- [ ] `npm install bcryptjs jsonwebtoken express-rate-limit cors` executado
- [ ] Script de migração de senhas criado e testado
- [ ] Login com senha antiga ainda funciona (após migração)
- [ ] Login com senha errada retorna 401
- [ ] Senhas no banco são hashes bcrypt (verificar no DB)
- [ ] JWT é gerado no login
- [ ] Sem token, todos os endpoints retornam 401
- [ ] Token inválido retorna 401
- [ ] Token expirado retorna 401 com mensagem apropriada
- [ ] `/api/auth/me` retorna dados do usuário
- [ ] `/api/auth/change-password` funciona
- [ ] Employee não consegue deletar (403)
- [ ] Manager não consegue criar usuário (403)
- [ ] Owner pode fazer tudo
- [ ] SQL injection em ORDER BY retorna erro ou usa fallback
- [ ] Rate limiting no login funciona (testar 6 tentativas rápidas)
- [ ] CORS configurado corretamente

### Critério de Sucesso

```bash
# Teste de regressão completo
curl -X POST http://localhost:5173/api/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}'
# Deve retornar token

curl http://localhost:5173/api/transactions
# Deve retornar 401

curl -H "Authorization: Bearer TOKEN_INVALIDO" http://localhost:5173/api/transactions
# Deve retornar 401

# Com token válido:
TOKEN=$(curl -s -X POST http://localhost:5173/api/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}' | jq -r '.token')
curl -H "Authorization: Bearer $TOKEN" http://localhost:5173/api/transactions
# Deve retornar dados

echo "FASE 1: VERIFICADA COM SUCESSO"
```

---

## FASE 2: QUALIDADE DE CÓDIGO

**Responsável:** Este plano  
**Dependência:** FASE 1  
**Tempo Estimado:** 3-4 horas  
**Criticidade:** 🟡 MÉDIA

### Visão Geral

Unificar APIs, melhorar performance com memoização, adicionar validações faltantes.

### 2.1 - Unificar API Client

#### 2.1.1 - Analisar Uso Atual

```
src/lib/api.ts       → usa axios (MAIORIA dos hooks)
src/services/api.ts  → usa fetch (useClientPayments)
```

#### 2.1.2 - Migrar useClientPayments para axios

**Arquivo:** `src/hooks/useClientPayments.ts`

```typescript
// ANTES (usando fetch)
const response = await fetch('/api/client-payments', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// DEPOIS (usando api.ts)
import { api } from '@/lib/api'
const response = await api.get('/client-payments')
```

#### 2.1.3 - Configurar Interceptors

**Arquivo:** `src/lib/api.ts`

```typescript
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor de request - adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de response - tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirecionar para login se não estiver lá
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // Log do erro
    console.error('API Error:', error.response?.data || error.message)
    
    return Promise.reject(error)
  }
)

// Helper para erros padronizados
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  if (error.message) {
    return error.message
  }
  return 'Erro desconhecido'
}
```

### 2.2 - Separar ServiceOrderForm

#### 2.2.1 - Estrutura de Componentes

```
src/components/service-orders/
├── ServiceOrderForm.tsx          # Container principal (965 linhas → 200 linhas)
├── ServiceOrderBasicInfo.tsx     # Info básicas (cliente, equipamento)
├── ServiceOrderTechnical.tsx     # Análise técnica
├── ServiceOrderPartsServices.tsx # Peças e serviços (field array)
├── ServiceOrderFinancial.tsx     # Valores e taxas
├── ServiceOrderPhotos.tsx        # Fotos (Base64)
├── ServiceOrderAccessories.tsx   # Acessórios e senhas
└── ServiceOrderActions.tsx       # Botões salvar/cancelar
```

#### 2.2.2 - Padrão de Composição

```typescript
// ServiceOrderForm.tsx (simplificado)
interface ServiceOrderFormProps {
  orderId?: number
  onSuccess: () => void
  onCancel: () => void
}

export function ServiceOrderForm({ orderId, onSuccess, onCancel }: ServiceOrderFormProps) {
  const { control, handleSubmit, watch, setValue, reset } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: initialValues
  })
  
  // States para cada seção
  const [basicInfo, setBasicInfo] = useState({ ... })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ServiceOrderBasicInfo control={control} />
      <ServiceOrderTechnical control={control} />
      <ServiceOrderPartsServices control={control} />
      <ServiceOrderFinancial control={control} />
      <ServiceOrderPhotos control={control} />
      <ServiceOrderAccessories control={control} />
      <ServiceOrderActions onCancel={onCancel} />
    </form>
  )
}
```

### 2.3 - Memoização de Componentes

#### 2.3.1 - Componentes com React.memo

```typescript
// src/components/transactions/TransactionList.tsx
export const TransactionList = React.memo(function TransactionList({ 
  transactions, 
  onEdit, 
  onDelete 
}: TransactionListProps) {
  // implementação
})

// src/components/customers/CustomerList.tsx
export const CustomerList = React.memo(function CustomerList({ 
  customers, 
  onEdit, 
  onDelete,
  onView 
}: CustomerListProps) {
  // implementação
})

// src/components/service-orders/ServiceOrderList.tsx
export const ServiceOrderList = React.memo(function ServiceOrderList({
  orders,
  onEdit,
  onView,
  onStatusChange
}: ServiceOrderListProps) {
  // implementação
})
```

#### 2.3.2 - Usar useMemo para Cálculos Caros

```typescript
// No componente Dashboard
const statusCounts = useMemo(() => {
  return serviceOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}, [serviceOrders])
```

### 2.4 - Adicionar Schemas Zod Faltantes

#### 2.4.1 - inventorySchema.ts

```typescript
import { z } from 'zod'

export const inventorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  category: z.enum(['product', 'service']),
  sku: z.string().max(50).optional().nullable(),
  unitPrice: z.number().min(0, 'Preço deve ser positivo'),
  costPrice: z.number().min(0).optional().default(0),
  salePrice: z.number().min(0).optional().default(0),
  quantity: z.number().int().min(0).optional().default(0),
  minQuantity: z.number().int().min(0).optional().default(5),
  stockLevel: z.number().int().min(0).optional().default(0)
})

export type InventoryFormData = z.infer<typeof inventorySchema>
```

#### 2.4.2 - settingsSchema.ts

```typescript
import { z } from 'zod'

export const settingsSchema = z.object({
  appName: z.string().min(1).max(100),
  appVersion: z.string().max(50).optional(),
  fiscalYear: z.string().length(4),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  profileName: z.string().max(200).optional().nullable(),
  initialBalance: z.number().min(0).optional().default(0),
  receiptLayout: z.enum(['a4', 'thermal']).default('a4'),
  companyCnpj: z.string().max(20).optional().nullable(),
  companyAddress: z.string().max(500).optional().nullable(),
  pixKey: z.string().max(100).optional().nullable()
})

export type SettingsFormData = z.infer<typeof settingsSchema>
```

#### 2.4.3 - brandSchema.ts, modelSchema.ts, etc.

```typescript
// brandSchema.ts
export const brandSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  equipmentType: z.string().max(100).optional().nullable()
})

// modelSchema.ts
export const modelSchema = z.object({
  brandId: z.number().int().positive('Selecione uma marca'),
  name: z.string().min(1, 'Nome é obrigatório').max(100)
})

// equipmentTypeSchema.ts
export const equipmentTypeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  icon: z.string().max(50).optional().nullable()
})
```

### 2.5 - Error Handling Global

#### 2.5.1 - Toast para Erros de Rede

```typescript
// Em App.tsx ou em um provider

api.interceptors.response.use(
  null,
  (error) => {
    if (!navigator.onLine) {
      toast.error('Sem conexão com a internet')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Tempo de resposta esgotado')
    } else if (error.response?.status === 500) {
      toast.error('Erro interno do servidor')
    } else if (error.response?.status === 403) {
      toast.error('Você não tem permissão para esta ação')
    }
    // Não mostrar toast para 401 (já tratado no interceptor)
    return Promise.reject(error)
  }
)
```

#### 2.5.2 - Error Boundary

```typescript
// src/components/ui/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
    // Aqui poderia enviar para um serviço de erro como Sentry
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
          <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Checklist de Verificação - FASE 2

- [ ] `src/services/api.ts` não é mais usado
- [ ] useClientPayments usa `lib/api.ts`
- [ ] Interceptor adiciona token automaticamente
- [ ] Interceptor trata 401 redirecionando para login
- [ ] Toast aparece para erros de rede
- [ ] ServiceOrderForm foi dividido em subcomponentes
- [ ] TransactionList usa React.memo
- [ ] CustomerList usa React.memo
- [ ] ServiceOrderList usa React.memo
- [ ] Schemas Zod criados para: inventory, settings, brand, model, equipmentType
- [ ] ErrorBoundary funcional em App.tsx

### Critério de Sucesso

```bash
# Navegar por todas as páginas
# Testar: Dashboard, Transactions, Customers, ServiceOrders, Inventory, Settings
# Tudo deve funcionar sem erros

npm run lint
# Deve retornar 0 errors

echo "FASE 2: VERIFICADA COM SUCESSO"
```

---

## FASE 3: ALINHAMENTO DO BANCO DE DADOS

**Responsável:** Este plano  
**Dependência:** FASE 1  
**Tempo Estimado:** 1-2 horas  
**Criticidade:** 🟡 MÉDIA

### 3.1 - Atualizar schema.prisma

#### 3.1.1 - Provider SQLite (não PostgreSQL)

```prisma
// ANTES
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// DEPOIS
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

#### 3.1.2 - Adicionar Colunas Faltantes

```prisma
model Transaction {
  id          Int      @id @default(autoincrement())
  description String
  category    String
  type        String   // "income" ou "expense"
  amount      Float
  date        String   // SQLite não tem DateTime nativo
  status      String   @default("Concluído")
  createdBy   Int?
  updatedBy   Int?
  paymentId   Int?     // NOVO - link para client_payments
  saleId      String?  // NOVO - para vendas futuras
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ServiceOrder {
  // ... campos existentes
  services     String   @default("[]")  // NOVO - JSON array
  // ... resto
}
```

#### 3.1.3 - Adicionar Relações de Usuário

```prisma
model ServiceOrder {
  // ...
  createdBy   User?    @relation("ServiceOrderCreator", fields: [createdById], references: [id])
  createdById Int?
  updatedBy   User?    @relation("ServiceOrderUpdater", fields: [updatedById], references: [id])
  updatedById Int?
  
  @@index([createdById])
  @@index([updatedById])
}

model InventoryItem {
  // ...
  createdBy   User?    @relation("InventoryCreator", fields: [createdById], references: [id])
  createdById Int?
  updatedBy   User?    @relation("InventoryUpdater", fields: [updatedById], references: [id])
  updatedById Int?
  
  @@index([createdById])
  @@index([updatedById])
}
```

#### 3.1.4 - Unificar Defaults de Status

```prisma
model ServiceOrder {
  status String @default("Aguardando Análise")
  // Portuguese para manter compatibilidade com dados existentes
}
```

### 3.2 - Limpar Dados de Teste

```sql
-- Remover cliente de teste com CPF inválido
DELETE FROM customers WHERE cpf = 'rfdfds' OR firstName LIKE '%xxx%';

-- Verificar outros dados suspeitos
SELECT * FROM customers WHERE firstName LIKE '%test%' OR lastName LIKE '%test%';
SELECT * FROM users WHERE username LIKE '%test%';
```

### 3.3 - Documentar Schema

Gerar documentação das tabelas para `docs/DATABASE.md`:

```markdown
## transactions

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | PK, autoincrement |
| description | TEXT | Descrição da transação |
| category | TEXT | Categoria (varchar) |
| type | TEXT | 'income' ou 'expense' |
| amount | REAL | Valor |
| date | TEXT | Data (ISO 8601) |
| status | TEXT | Status padrão: 'Concluído' |
| createdBy | INTEGER | FK → users.id |
| updatedBy | INTEGER | FK → users.id |
| paymentId | INTEGER | FK → client_payments.id (opcional) |
| saleId | TEXT | Para links de vendas futuras |
```

### Checklist de Verificação - FASE 3

- [ ] schema.prisma usa provider = "sqlite"
- [ ] Colunas paymentId e saleId em Transaction
- [ ] Coluna services em ServiceOrder
- [ ] Relações createdBy/updatedBy definidas
- [ ] Dados de teste removidos
- [ ] `npx prisma validate` passa
- [ ] Documentação gerada

### Critério de Sucesso

```bash
npx prisma validate && echo "FASE 3: VERIFICADA COM SUCESSO"
```

---

## FASE 4: FRONTEND - MELHORIAS

**Responsável:** Este plano  
**Dependência:** FASE 2  
**Tempo Estimado:** 2-3 horas  
**Criticidade:** 🟢 BAIXA

### 4.1 - Implementar Exportação CSV

```typescript
// src/lib/export.ts
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) => {
  const headers = columns.map(c => c.label).join(',')
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key]
      // Escapar vírgulas e aspas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(',')
  )
  
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}
```

**Uso na página de relatórios:**
```typescript
const handleExportTransactions = () => {
  exportToCSV(transactions, 'transacoes', [
    { key: 'date', label: 'Data' },
    { key: 'description', label: 'Descrição' },
    { key: 'category', label: 'Categoria' },
    { key: 'type', label: 'Tipo' },
    { key: 'amount', label: 'Valor' }
  ])
}
```

### 4.2 - Implementar Alertas de Estoque

**Backend:**
```typescript
// GET /api/inventory/alerts
app.get('/api/inventory/alerts', authMiddleware, (req, res) => {
  const alerts = db.prepare(`
    SELECT * FROM inventory_items 
    WHERE quantity < minQuantity 
    AND category = 'product'
  `).all()
  
  res.json(alerts)
})
```

**Frontend:**
```typescript
// No Header ou Sidebar
const { data: alerts } = useQuery({
  queryKey: ['inventory-alerts'],
  queryFn: () => api.get('/inventory/alerts').then(r => r.data)
})

// Badge no ícone
{alerts && alerts.length > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    {alerts.length}
  </span>
)}
```

### 4.3 - Sistema de Notificações

#### Backend - Endpoint de Notificações

```typescript
// GET /api/notifications
app.get('/api/notifications', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user!.userId
  
  // Pagamentos vencendo nos próximos 3 dias
  const upcomingPayments = db.prepare(`
    SELECT cp.*, c.firstName, c.lastName 
    FROM client_payments cp
    JOIN customers c ON cp.customerId = c.id
    WHERE cp.status IN ('pending', 'partial')
    AND date(cp.dueDate) <= date('now', '+3 days')
  `).all()
  
  // OS sem atualização há mais de 7 dias
  const staleOrders = db.prepare(`
    SELECT * FROM service_orders 
    WHERE status NOT IN ('Entregue', 'Cancelado')
    AND date(createdAt) <= date('now', '-7 days')
  `).all()
  
  res.json({
    payments: upcomingPayments,
    serviceOrders: staleOrders,
    timestamp: new Date().toISOString()
  })
})
```

#### Frontend - NotificationCenter

```typescript
// src/components/layout/NotificationCenter.tsx
export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 60000 // Atualizar a cada minuto
  })
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <Bell className="w-6 h-6" />
        {(notifications?.payments?.length || notifications?.serviceOrders?.length) && (
          <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full" />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg">
          {/* Lista de notificações */}
        </div>
      )}
    </div>
  )
}
```

### Checklist de Verificação - FASE 4

- [ ] Exportação CSV funciona para transações
- [ ] Exportação CSV funciona para clientes
- [ ] Alertas de estoque aparecem no header
- [ ] NotificaçãoCenter abre e mostra dados
- [ ] Notificações são atualizadas automaticamente

### Critério de Sucesso

```bash
echo "FASE 4: VERIFICADA COM SUCESSO - Teste manual necessário"
```

---

## FASE 5: INTEGRAÇÕES

**Responsável:** Este plano  
**Dependência:** FASE 4  
**Tempo Estimado:** 2-4 horas  
**Criticidade:** 🟢 BAIXA

### 5.1 - Decidir sobre SendPulse/WhatsApp

#### Opção A: Remover (Recomendado se não usar)

```bash
# Remover do package.json se não for usar
npm uninstall @sendpulse/sdk

# Remover campos do banco (opcional, manter por compatibilidade)
# Manter whatsappBillingTemplate e whatsappOSTemplate no schema
```

#### Opção B: Implementar (se necessáriO)

```typescript
// src/lib/whatsapp.ts
import axios from 'axios'

const SENDPULSE_API = 'https://api.sendpulse.com'

export const sendWhatsAppMessage = async (options: {
  phone: string
  templateId: string
  variables: Record<string, string>
}) => {
  const { phone, templateId, variables } = options
  
  // Implementar chamada SendPulse
  // Nota: Requer token de acesso OAuth
}
```

### 5.2 - Decidir sobre Gemini AI

#### Opção A: Remover (Recomendado se não usa)

```bash
npm uninstall @google/genai
```

#### Opção B: Implementar Feature

Exemplo: Análise automática de OS
```typescript
// src/services/gemini.ts
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export const analyzeServiceOrder = async (orderDescription: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Analise este problema técnico e sugira diagnósticos possíveis: ${orderDescription}`
  })
  return response.text
}
```

### Checklist de Verificação - FASE 5

- [ ] Decisão tomada sobre SendPulse (implementar ou remover)
- [ ] Decisão tomada sobre Gemini (implementar ou remover)
- [ ] Se remover, dependências limpas do package.json
- [ ] Se implementar, feature funcional e testada

---

## FASE 6: TESTES E VALIDADE

**Responsável:** Este plano  
**Dependência:** TODAS AS FASES ANTERIORES  
**Tempo Estimado:** 2-3 horas  
**Criticidade:** 🔴 CRÍTICO

### 6.1 - Checklist de Testes Manuais

#### Autenticação
- [ ] Login com credenciais corretas → token retornado
- [ ] Login com credenciais incorretas → 401
- [ ] Login após 5 tentativas erradas → rate limited
- [ ] Logout → token removido do client
- [ ] `/api/auth/me` retorna usuário correto
- [ ] Change password → senha atualiza
- [ ] Token expirado → 401

#### Autorização
- [ ] Employee: criar transação → sucesso
- [ ] Employee: deletar transação → 403
- [ ] Employee: criar OS → sucesso
- [ ] Employee: deletar OS → 403
- [ ] Employee: ver audit logs → 403
- [ ] Manager: deletar transação → sucesso
- [ ] Manager: deletar usuário → 403
- [ ] Manager: ver audit logs → sucesso
- [ ] Owner: todas as ações → sucesso

#### Segurança
- [ ] Sem token → todos endpoints 401
- [ ] SQL injection em search → não executa
- [ ] SQL injection em sort → não executa
- [ ] XSS em campos de texto → sanitizado na exibição

#### Funcionalidades
- [ ] CRUD Customers completo
- [ ] CRUD Transactions completo
- [ ] CRUD Service Orders completo
- [ ] CRUD Inventory completo
- [ ] Pagamentos com parcels → transações criadas
- [ ] OS com peças → estoque atualizado
- [ ] Export CSV → arquivo gerado

#### Performance
- [ ] Navegação entre páginas fluida
- [ ] Sem lag em listas de 100+ items
- [ ] Sem memory leaks após uso prolongado

### 6.2 - Teste de Regressão Completo

```bash
# 1. Backup do banco atual
cp finance.db backups/$(date +%Y-%m-%d)/finance.db

# 2. Testar login
TOKEN=$(curl -s -X POST http://localhost:5173/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.token')

# 3. Testar endpoint protegido
curl -H "Authorization: Bearer $TOKEN" http://localhost:5173/api/customers

# 4. Verificar todos os status codes
echo "Testando status codes..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/api/transactions
# Esperado: 200 ou 401 (se token válido)

echo ""
echo "TESTE DE REGRESSÃO COMPLETO"
```

### Critério de Sucesso

```bash
# Todos os testes manuais passando
# Nenhum erro no console do navegador
# npm run lint retorna 0

echo "FASE 6: VERIFICADA COM SUCESSO"
```

---

## FASE 7: DOCUMENTAÇÃO

**Responsável:** Este plano  
**Dependência:** FASE 6  
**Tempo Estimado:** 1 hora  
**Criticidade:** 🟢 BAIXA

### 7.1 - Atualizar Documentos Existentes

#### ARCHITECTURE.md

```markdown
## Segurança

### Autenticação
- JWT com expiração de 7 dias
- bcrypt para hash de senhas
- Rate limiting: 5 tentativas de login por 15 minutos

### Autorização
- Roles: owner, manager, employee
- Middleware: authMiddleware e requireRole
- Tabela de permissões em IMPLEMENTATION_PLAN.md

### CORS
- Origin: FRONTEND_URL (default: http://localhost:5173)
- Credentials: true
```

#### DEVELOPER_GUIDE.md

```markdown
## Setup de Segurança

1. Copiar `.env.example` para `.env`
2. Alterar `JWT_SECRET` para um valor único e seguro
3. Executar migração de senhas: `npm run migrate-passwords`

## Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| JWT_SECRET | Sim | Secret para assinar JWTs |
| JWT_EXPIRES_IN | Não | Tempo de expiração (default: 7d) |
| FRONTEND_URL | Não | URL do frontend para CORS |
```

### 7.2 - Criar CHANGELOG

**Arquivo:** `docs/CHANGELOG.md`

```markdown
# Changelog

## [1.1.0] - 2026-04-XX

### Segurança
- ✅ Autenticação JWT implementada
- ✅ Senhas com bcrypt (hash)
- ✅ Roles e permissões (owner/manager/employee)
- ✅ Rate limiting no login
- ✅ CORS configurado
- ✅ SQL injection prevenido via whitelist

### Código
- ✅ API unificada com axios
- ✅ ServiceOrderForm separado em componentes
- ✅ Memoização de listas
- ✅ Schemas Zod para todas as entidades
- ✅ Error handling global

### Banco
- ✅ Prisma schema atualizado para SQLite
- ✅ Colunas faltantes adicionadas
- ✅ Dados de teste limpos
```

### 7.3 - Documentar Decisões

**Arquivo:** `docs/DECISIONS.md`

```markdown
# Decisões de Arquitetura

## Autenticação: JWT vs Sessions

**Decisão:** JWT

**Rationale:**
- Stateless é melhor para APIs
- Mais fácil de escalar horizontalmente
- Suporte nativo em Supabase futuro

## bcrypt vs argon2

**Decisão:** bcrypt

**Rationale:**
- Suporte nativo em Node.js (bcryptjs)
- Suficiente para maioria dos casos
- Argon2 mais seguro mas mais complexo

## axios vs fetch

**Decisão:** axios

**Rationale:**
- Interceptors nativos
- Transformação de request/response
- Melhor error handling
```

### Checklist de Verificação - FASE 7

- [ ] ARCHITECTURE.md atualizado com decisões de segurança
- [ ] DEVELOPER_GUIDE.md atualizado com setup
- [ ] CHANGELOG.md criado
- [ ] DECISIONS.md criado

---

## FASE 8: PREPARAÇÃO PARA MIGRAÇÃO

**Responsável:** Este plano (futuro)  
**Dependência:** TODAS AS FASES ANTERIORES  
**Tempo Estimado:** A definir  
**Criticidade:** 🟢 BAIXA

### 8.1 - Quando Migrar para Supabase

Esta fase deve ser executada APENAS quando:
1. Todas as fases anteriores verificadas
2. Sistema em produção por pelo menos 1 mês sem incidentes
3. Volume de dados justificando PostgreSQL

### 8.2 - Passos para Migração

1. **Preparar Supabase**
   - Criar projeto no Supabase
   - Configurar DATABASE_URL

2. **Mudar Provider Prisma**
   ```prisma
   provider = "postgresql"
   url      = env("DATABASE_URL")
   ```

3. **Gerar Migration**
   ```bash
   npx prisma migrate dev --name add_supabase
   ```

4. **Exportar Dados SQLite**
   ```bash
   node scripts/exportSqliteToJson.js
   ```

5. **Importar para PostgreSQL**
   ```bash
   node scripts/importToPostgres.js
   ```

6. **Deploy**
   - Configurar variáveis de produção
   - Deploy para Render/Railway/etc

### 8.3 - Preparação de Scripts

**Arquivo:** `scripts/exportSqlite.ts`
```typescript
// Exportar dados do SQLite para JSON
// Executar antes de migrar
```

**Arquivo:** `scripts/importPostgres.ts`
```typescript
// Importar dados JSON para PostgreSQL
// Executar após migration Prisma
```

---

## RESUMO DAS FASES

| Fase | Nome | Tempo | Dependência | Status |
|------|------|-------|-------------|--------|
| 0 | Preparação | 30 min | Nenhuma | ⬜ |
| 1 | Segurança | 4-6h | 0 | ⬜ |
| 2 | Qualidade Código | 3-4h | 1 | ⬜ |
| 3 | DB Schema | 1-2h | 1 | ⬜ |
| 4 | Frontend | 2-3h | 2 | ⬜ |
| 5 | Integrações | 2-4h | 4 | ⬜ |
| 6 | Testes | 2-3h | Todas | ⬜ |
| 7 | Documentação | 1h | 6 | ⬜ |
| 8 | Migração Prep | A definir | Todas | ⬜ |

**Total Estimado:** ~16-24 horas

---

## PRÓXIMOS PASSOS

1. ⬜ Confirmar este plano
2. ⬜ Criar pasta `backups/`
3. ⬜ Executar FASE 0: Backup completo
4. ⬜ Executar FASE 1: Segurança
5. ⬜ ...

---

*Plano criado em: 2026-04-13*
*Última atualização: 2026-04-13*
