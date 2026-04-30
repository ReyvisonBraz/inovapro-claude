import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return successResponse(data)
    }

    if (req.method === 'POST') {
      const body = await req.json()

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: body.name,
          category: body.category,
          sku: body.sku || null,
          costPrice: parseFloat(body.costPrice || 0),
          salePrice: parseFloat(body.salePrice || body.unitPrice || 0),
          quantity: parseInt(body.quantity || 0),
          minQuantity: parseInt(body.minQuantity || 5),
          unitPrice: parseFloat(body.unitPrice || body.salePrice || 0),
          stockLevel: parseInt(body.stockLevel || body.quantity || 0)
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
        .from('inventory_items')
        .update({
          name: body.name,
          category: body.category,
          sku: body.sku || null,
          costPrice: parseFloat(body.costPrice || 0),
          salePrice: parseFloat(body.salePrice || 0),
          quantity: parseInt(body.quantity || 0),
          minQuantity: parseInt(body.minQuantity || 5),
          unitPrice: parseFloat(body.unitPrice || 0),
          stockLevel: parseInt(body.stockLevel || 0)
        })
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const id = url.pathname.split('/').pop()

      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Inventory error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})