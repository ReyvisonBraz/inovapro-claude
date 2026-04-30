import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('service_order_statuses')
        .select('*')
        .order('priority', { ascending: true })

      if (error) throw error
      return successResponse(data)
    }

    if (req.method === 'POST') {
      const body = await req.json()

      const { data, error } = await supabase
        .from('service_order_statuses')
        .insert({
          name: body.name,
          color: body.color,
          priority: body.priority || 0,
          isDefault: body.isDefault || 0
        })
        .select()
        .single()

      if (error) throw error
      return successResponse({ id: data.id })
    }

    if (req.method === 'PUT') {
      const url = new URL(req.url)
      const id = url.pathname.split('/').pop()
      const body = await req.json()

      const { error } = await supabase
        .from('service_order_statuses')
        .update({
          name: body.name,
          color: body.color,
          priority: body.priority || 0,
          isDefault: body.isDefault || 0
        })
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const id = url.pathname.split('/').pop()

      const { error } = await supabase
        .from('service_order_statuses')
        .delete()
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Service Order Statuses error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})