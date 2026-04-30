import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, users:name')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) throw error

      const logs = (data || []).map(l => ({
        ...l,
        userName: l.users?.name || null
      }))

      return successResponse(logs)
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Audit Logs error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})