import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const id = segments[segments.length - 1]
  const isIdRoute = !isNaN(parseInt(id)) && id !== 'client-payments'

  try {
    // GET /client-payments - List
    if (req.method === 'GET' && !isIdRoute) {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const search = url.searchParams.get('search') || ''

      let query = supabase
        .from('client_payments')
        .select('*, customers:firstName,lastName', { count: 'exact' })
        .order('dueDate', { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

      if (search) {
        query = query.or(
          `description.ilike.%${search}%,saleId.ilike.%${search}%`
        )
      }

      const { data, error, count } = await query

      if (error) throw error

      const payments = (data || []).map(p => ({
        ...p,
        customerName: p.customers ? `${p.customers.firstName} ${p.customers.lastName}` : null
      }))

      return successResponse({
        data: payments,
        meta: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }

    // POST /client-payments - Create
    if (req.method === 'POST') {
      const body = await req.json()

      const { data, error } = await supabase
        .from('client_payments')
        .insert({
          customerId: body.customerId,
          description: body.description,
          totalAmount: parseFloat(body.totalAmount),
          paidAmount: parseFloat(body.paidAmount || 0),
          purchaseDate: body.purchaseDate,
          dueDate: body.dueDate,
          paymentMethod: body.paymentMethod,
          status: body.status || 'pending',
          installmentsCount: body.installmentsCount || 1,
          type: body.type || 'income',
          saleId: body.saleId || null,
          paymentHistory: body.paymentHistory || '[]'
        })
        .select()
        .single()

      if (error) throw error

      // Create transaction if there's initial payment
      if (body.paidAmount > 0) {
        await supabase.from('transactions').insert({
          description: `Pagamento: ${body.description}`,
          category: 'Vendas',
          type: 'income',
          amount: parseFloat(body.paidAmount),
          date: body.purchaseDate,
          paymentId: data.id,
          saleId: body.saleId || null
        })
      }

      return successResponse({ id: data.id })
    }

    // PATCH /client-payments/:id - Update partial
    if (req.method === 'PATCH' && isIdRoute) {
      const body = await req.json()

      const updateData: Record<string, any> = {}
      if (body.paidAmount !== undefined) updateData.paidAmount = parseFloat(body.paidAmount)
      if (body.status !== undefined) updateData.status = body.status
      if (body.paymentHistory !== undefined) updateData.paymentHistory = JSON.stringify(body.paymentHistory)

      const { error } = await supabase
        .from('client_payments')
        .update(updateData)
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    // POST /client-payments/:id/pay - Record payment
    if (req.method === 'POST' && isIdRoute && url.pathname.includes('/pay')) {
      const body = await req.json()

      // Get current payment
      const { data: payment, error: paymentError } = await supabase
        .from('client_payments')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (paymentError || !payment) {
        return errorResponse('Payment não encontrado', 404)
      }

      const newPaidAmount = payment.paidAmount + parseFloat(body.amount)
      const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'partial'

      let history = []
      try {
        history = JSON.parse(payment.paymentHistory || '[]')
      } catch (e) {}
      history.push({
        amount: parseFloat(body.amount),
        date: body.date || new Date().toISOString()
      })

      await supabase
        .from('client_payments')
        .update({
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentHistory: JSON.stringify(history)
        })
        .eq('id', parseInt(id))

      // Create transaction
      await supabase.from('transactions').insert({
        description: `Recebimento: ${payment.description}`,
        category: 'Vendas',
        type: 'income',
        amount: parseFloat(body.amount),
        date: body.date || new Date().toISOString().split('T')[0],
        paymentId: parseInt(id),
        saleId: payment.saleId || null
      })

      return successResponse({ success: true, newPaidAmount, newStatus })
    }

    // DELETE /client-payments/:id - Delete
    if (req.method === 'DELETE' && isIdRoute) {
      await supabase.from('transactions').delete().eq('paymentId', parseInt(id))
      await supabase.from('receipts').delete().eq('paymentId', parseInt(id))

      const { error } = await supabase
        .from('client_payments')
        .delete()
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Client Payments error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})