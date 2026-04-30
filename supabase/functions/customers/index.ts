import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const id = segments[segments.length - 1]
  const isIdRoute = !isNaN(parseInt(id)) && id !== 'customers'

  try {
    // GET /customers - List with pagination
    if (req.method === 'GET' && !isIdRoute) {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const search = url.searchParams.get('search') || ''

      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('firstName', { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

      if (search) {
        query = query.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,phone.ilike.%${search}%`)
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

    // GET /customers/:id - Get single
    if (req.method === 'GET' && isIdRoute) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (error) throw error
      return successResponse(data)
    }

    // POST /customers - Create
    if (req.method === 'POST') {
      const body = await req.json()
      const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit } = body

      if (!firstName || !lastName) {
        return errorResponse('FirstName e LastName são obrigatórios')
      }

      const { data, error } = await supabase
        .from('customers')
        .insert({
          firstName,
          lastName,
          nickname: nickname || null,
          cpf: cpf || null,
          companyName: companyName || null,
          phone: phone || '',
          observation: observation || null,
          creditLimit: creditLimit || 0
        })
        .select()
        .single()

      if (error) throw error
      return successResponse({ id: data.id })
    }

    // PUT /customers/:id - Update
    if (req.method === 'PUT' && isIdRoute) {
      const body = await req.json()

      const { data, error } = await supabase
        .from('customers')
        .update({
          firstName: body.firstName,
          lastName: body.lastName,
          nickname: body.nickname || null,
          cpf: body.cpf || null,
          companyName: body.companyName || null,
          phone: body.phone || '',
          observation: body.observation || null,
          creditLimit: body.creditLimit || 0
        })
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    // DELETE /customers/:id - Delete
    if (req.method === 'DELETE' && isIdRoute) {
      const customerId = parseInt(id)

      // Delete related records first
      const { data: payments } = await supabase
        .from('client_payments')
        .select('id')
        .eq('customerId', customerId)

      if (payments) {
        for (const p of payments) {
          await supabase.from('transactions').delete().eq('paymentId', p.id)
          await supabase.from('receipts').delete().eq('paymentId', p.id)
        }
      }

      await supabase.from('client_payments').delete().eq('customerId', customerId)
      await supabase.from('service_orders').delete().eq('customerId', customerId)
      await supabase.from('customers').delete().eq('id', customerId)

      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Customers error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})