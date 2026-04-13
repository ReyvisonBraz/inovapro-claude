/**
 * Middleware de Autorização Baseado em Roles
 * 
 * Verifica se o usuário tem permissão para executar uma ação
 * Baseado nas roles: owner, manager, employee
 */

import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

// Tipos de roles disponíveis no sistema
export type Role = 'owner' | 'manager' | 'employee'

// Mapeamento de permissões por role
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  owner: [
    // Transactions
    'transaction:create',
    'transaction:read',
    'transaction:update',
    'transaction:delete',
    // Customers
    'customer:create',
    'customer:read',
    'customer:update',
    'customer:delete',
    // Payments
    'payment:create',
    'payment:read',
    'payment:update',
    'payment:delete',
    // Service Orders
    'service_order:create',
    'service_order:read',
    'service_order:update',
    'service_order:delete',
    // Inventory
    'inventory:create',
    'inventory:read',
    'inventory:update',
    'inventory:delete',
    // Users
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    // Audit
    'audit:read',
    // Settings
    'settings:read',
    'settings:update',
    // Catalog
    'catalog:create',
    'catalog:read',
    'catalog:update',
    'catalog:delete',
  ],
  manager: [
    // Transactions
    'transaction:create',
    'transaction:read',
    'transaction:update',
    'transaction:delete',
    // Customers
    'customer:create',
    'customer:read',
    'customer:update',
    'customer:delete',
    // Payments
    'payment:create',
    'payment:read',
    'payment:update',
    'payment:delete',
    // Service Orders
    'service_order:create',
    'service_order:read',
    'service_order:update',
    'service_order:delete',
    // Inventory
    'inventory:create',
    'inventory:read',
    'inventory:update',
    // Não pode deletar inventory
    // Users
    'user:read',
    // Não pode criar/atualizar/deletar usuários
    // Audit
    'audit:read',
    // Settings
    'settings:read',
    // Catalog
    'catalog:create',
    'catalog:read',
    'catalog:update',
    'catalog:delete',
  ],
  employee: [
    // Transactions
    'transaction:create',
    'transaction:read',
    'transaction:update',
    // Não pode deletar transactions
    // Customers
    'customer:create',
    'customer:read',
    'customer:update',
    'customer:delete',
    // Payments
    'payment:create',
    'payment:read',
    'payment:update',
    'payment:delete',
    // Service Orders
    'service_order:create',
    'service_order:read',
    'service_order:update',
    'service_order:delete',
    // Inventory
    'inventory:read',
    // Não pode criar/atualizar/deletar inventory
    // Users
    'user:read',
    // Audit
    // Não pode ver audit logs
    // Settings
    'settings:read',
    // Catalog
    'catalog:read',
    // Não pode gerenciar catalog
  ],
}

/**
 * Middleware que verifica se o usuário tem uma das roles especificadas
 * 
 * Uso:
 * import { requireRole } from '@/middleware/roles'
 * 
 * // Qualquer uma das roles especificadas
 * app.delete('/api/transactions/:id', authMiddleware, requireRole('owner', 'manager'), handler)
 * 
 * // Apenas owner
 * app.delete('/api/users/:id', authMiddleware, requireRole('owner'), handler)
 */
export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Primeiro verifica se o usuário está autenticado
    if (!req.user) {
      res.status(401).json({ 
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      })
      return
    }

    // Verifica se a role do usuário está na lista de roles permitidas
    const userRole = req.user.role as Role

    if (!roles.includes(userRole)) {
      res.status(403).json({ 
        error: `Acesso proibido. Esta ação requer uma das seguintes roles: ${roles.join(', ')}`,
        code: 'FORBIDDEN_ROLE',
        userRole: userRole,
        requiredRoles: roles
      })
      return
    }

    next()
  }
}

/**
 * Middleware que verifica se o usuário tem uma permissão específica
 * 
 * Uso:
 * import { requirePermission } from '@/middleware/roles'
 * 
 * app.delete('/api/transactions/:id', authMiddleware, requirePermission('transaction:delete'), handler)
 */
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      })
      return
    }

    const userRole = req.user.role as Role
    const permissions = ROLE_PERMISSIONS[userRole] || []

    if (!permissions.includes(permission)) {
      res.status(403).json({ 
        error: `Acesso proibido. A permissão '${permission}' é necessária para esta ação.`,
        code: 'FORBIDDEN_PERMISSION',
        permission: permission,
        userRole: userRole
      })
      return
    }

    next()
  }
}

/**
 * Helper para verificar se uma role tem uma permissão
 * Útil para UI (desabilitar botões, etc)
 */
export const hasPermission = (role: Role, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

/**
 * Helper para pegar todas as permissões de uma role
 */
export const getPermissions = (role: Role): string[] => {
  return ROLE_PERMISSIONS[role] || []
}
