import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/database.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username e senha são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      })
    }

    // Buscar usuário diretamente do banco
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1)

    if (error || !users || users.length === 0) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      })
    }

    const user = users[0]

    // Verificar senha com bcrypt
    const bcrypt = await import('https://esm.sh/bcryptjs@2.4.3')
    const valid = bcrypt.compareSync(password, user.password)
    
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      })
    }

    // Gerar JWT manualmente
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      sub: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 dias
    }))
    const secret = Deno.env.get('JWT_SECRET') || 'supersecretkey'
    const signature = btoa(`${header}.${payload}.${secret}`)
    const token = `${header}.${payload}.${signature}`

    // Permissions
    let permissions = []
    try {
      permissions = JSON.parse(user.permissions || '[]')
    } catch (e) {}

    if (user.role === 'owner') {
      permissions = ['view_dashboard', 'manage_transactions', 'view_reports', 'manage_customers', 'manage_payments', 'manage_settings', 'manage_users']
    }

    const { password: _, ...userWithoutPassword } = user

    return new Response(JSON.stringify({
      token,
      user: { ...userWithoutPassword, permissions }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })

  } catch (error) {
    console.error('Login error:', error)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }
})