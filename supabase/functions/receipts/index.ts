import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const paymentId = segments[segments.length - 2]

  try {
    // GET /receipts/:paymentId - List receipts for a payment
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('paymentId', parseInt(paymentId))
        .order('createdAt', { ascending: false })

      if (error) throw error
      return successResponse(data)
    }

    // POST /receipts - Create receipt
    if (req.method === 'POST') {
      const body = await req.json()

      const { data, error } = await supabase
        .from('receipts')
        .insert({
          paymentId: body.paymentId,
          content: body.content
        })
        .select()
        .single()

      if (error) throw error
      return successResponse({ id: data.id })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Receipts error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})