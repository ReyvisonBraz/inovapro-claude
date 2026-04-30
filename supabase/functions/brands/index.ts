import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('brands')
        .select('*, models(*)')
        .order('name', { ascending: true })

      if (error) throw error
      return successResponse(data)
    }

    if (req.method === 'POST') {
      const body = await req.json()

      const { data, error } = await supabase
        .from('brands')
        .insert({
          name: body.name,
          equipmentType: body.equipmentType || null
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
        .from('brands')
        .update({
          name: body.name,
          equipmentType: body.equipmentType || null
        })
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const id = url.pathname.split('/').pop()

      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Brands error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})