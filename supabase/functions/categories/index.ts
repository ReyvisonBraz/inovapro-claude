import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()

  try {
    // GET /categories - List all
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return successResponse(data)
    }

    // POST /categories - Create
    if (req.method === 'POST') {
      const { name, type } = await req.json()

      if (!name || !type) {
        return errorResponse('Name e type são obrigatórios')
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({ name, type })
        .select()
        .single()

      if (error) throw error
      return successResponse({ id: data.id })
    }

    // DELETE /categories/:id - Delete
    if (req.method === 'DELETE' && path) {
      const id = parseInt(path)

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Categories error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})