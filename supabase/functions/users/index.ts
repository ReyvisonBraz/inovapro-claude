import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const id = segments[segments.length - 1]
  const isIdRoute = !isNaN(parseInt(id)) && id !== 'users'

  try {
    // GET /users - List all
    if (req.method === 'GET' && !isIdRoute) {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, name, permissions, createdAt')
        .order('name', { ascending: true })

      if (error) throw error

      const usersWithPermissions = (data || []).map(u => ({
        ...u,
        permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : (u.permissions || [])
      }))

      return successResponse(usersWithPermissions)
    }

    // POST /users - Create
    if (req.method === 'POST') {
      const body = await req.json()
      const { username, password, role, name, permissions } = body

      if (!username || !password || !role || !name) {
        return errorResponse('username, password, role e name são obrigatórios')
      }

      // Hash password with bcrypt
      const bcrypt = await import('https://esm.sh/bcryptjs@2.4.3')
      const hashedPassword = bcrypt.hashSync(password, 10)

      const { data, error } = await supabase
        .from('users')
        .insert({
          username,
          password: hashedPassword,
          role,
          name,
          permissions: JSON.stringify(permissions || [])
        })
        .select()
        .single()

      if (error) throw error
      return successResponse({ id: data.id })
    }

    // PUT /users/:id - Update
    if (req.method === 'PUT' && isIdRoute) {
      const body = await req.json()
      const { name, role, password, permissions } = body

      const updateData: Record<string, any> = { name, role }
      if (permissions !== undefined) {
        updateData.permissions = JSON.stringify(permissions)
      }
      if (password) {
        const bcrypt = await import('https://esm.sh/bcryptjs@2.4.3')
        updateData.password = bcrypt.hashSync(password, 10)
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    // DELETE /users/:id - Delete
    if (req.method === 'DELETE' && isIdRoute) {
      // Clear FK references first
      await supabase
        .from('audit_logs')
        .update({ userId: null })
        .eq('userId', parseInt(id))

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Users error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})