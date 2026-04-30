import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const id = segments[segments.length - 1]
  const isIdRoute = !isNaN(parseInt(id)) && id !== 'transactions'

  try {
    // GET /transactions - List with filters
    if (req.method === 'GET' && !isIdRoute) {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const search = url.searchParams.get('search') || ''
      const type = url.searchParams.get('type') || ''
      const category = url.searchParams.get('category') || ''
      const startDate = url.searchParams.get('startDate') || ''
      const endDate = url.searchParams.get('endDate') || ''

      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (search) {
        query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`)
      }

      if (type && type !== 'all') {
        query = query.eq('type', type)
      }

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error, count } = await query

      if (error) throw error

      return successResponse({
        data: data || [],
        meta: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }

    // GET /transactions/:id - Get single
    if (req.method === 'GET' && isIdRoute) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (error) throw error
      return successResponse(data)
    }

    // POST /transactions - Create
    if (req.method === 'POST') {
      const body = await req.json()
      const { description, category, type, amount, date } = body

      if (!category || !type || !amount || !date) {
        return errorResponse('category, type, amount e date são obrigatórios')
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          description: description || 'Sem descrição',
          category,
          type,
          amount: parseFloat(amount),
          date,
          status: 'Concluído'
        })
        .select()
        .single()

      if (error) throw error
      return successResponse({ id: data.id })
    }

    // PUT /transactions/:id - Update
    if (req.method === 'PUT' && isIdRoute) {
      const body = await req.json()
      const { description, category, type, amount, date } = body

      const { error } = await supabase
        .from('transactions')
        .update({
          description: description || 'Sem descrição',
          category,
          type,
          amount: parseFloat(amount),
          date
        })
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    // DELETE /transactions/:id - Delete
    if (req.method === 'DELETE' && isIdRoute) {
      const txId = parseInt(id)

      // Get transaction to update payment if linked
      const { data: tx } = await supabase
        .from('transactions')
        .select('paymentId, amount')
        .eq('id', txId)
        .single()

      if (tx?.paymentId) {
        const { data: payment } = await supabase
          .from('client_payments')
          .select('paidAmount, totalAmount')
          .eq('id', tx.paymentId)
          .single()

        if (payment) {
          const newPaidAmount = Math.max(0, payment.paidAmount - tx.amount)
          const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'pending'
          await supabase
            .from('client_payments')
            .update({ paidAmount: newPaidAmount, status: newStatus })
            .eq('id', tx.paymentId)
        }
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', txId)

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Transactions error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})