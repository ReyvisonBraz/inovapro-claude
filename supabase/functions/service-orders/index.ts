import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const id = segments[segments.length - 1]
  const isIdRoute = !isNaN(parseInt(id)) && id !== 'service-orders'

  try {
    // GET /service-orders - List with filters
    if (req.method === 'GET' && !isIdRoute) {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const search = url.searchParams.get('search') || ''
      const status = url.searchParams.get('status') || ''
      const priority = url.searchParams.get('priority') || ''
      const sortBy = url.searchParams.get('sortBy') || 'newest'

      let query = supabase
        .from('service_orders')
        .select(`
          *,
          customers:firstName,lastName,phone
        `, { count: 'exact' })

      if (search) {
        query = query.or(
          `reportedProblem.ilike.%${search}%,equipmentBrand.ilike.%${search}%,equipmentModel.ilike.%${search}%`
        )
      }

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      if (priority && priority !== 'all') {
        query = query.eq('priority', priority)
      }

      // Sorting
      if (sortBy === 'newest') {
        query = query.order('createdAt', { ascending: false })
      } else if (sortBy === 'oldest') {
        query = query.order('createdAt', { ascending: true })
      } else if (sortBy === 'priority') {
        query = query.order('priority', { ascending: true })
      } else if (sortBy === 'amount-desc') {
        query = query.order('totalAmount', { ascending: false })
      }

      query = query.range((page - 1) * limit, page * limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      // Parse JSON fields
      const orders = (data || []).map(o => ({
        ...o,
        partsUsed: o.partsUsed ? JSON.parse(o.partsUsed) : [],
        services: o.services ? JSON.parse(o.services) : []
      }))

      // Get counts
      const { count: awaiting } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Aguardando Análise', 'Aguardando Peças'])

      const { count: active } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Em Manutenção', 'Em Reparo', 'Aprovado'])

      const { count: ready } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pronto para Retirada', 'Pronto', 'Concluído'])

      return successResponse({
        data: orders,
        meta: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
          counts: {
            awaiting: awaiting || 0,
            active: active || 0,
            ready: ready || 0
          }
        }
      })
    }

    // GET /service-orders/:id - Get single
    if (req.method === 'GET' && isIdRoute) {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (error) throw error

      return successResponse({
        ...data,
        partsUsed: data.partsUsed ? JSON.parse(data.partsUsed) : [],
        services: data.services ? JSON.parse(data.services) : []
      })
    }

    // POST /service-orders - Create
    if (req.method === 'POST') {
      const body = await req.json()

      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          customerId: body.customerId,
          equipmentType: body.equipmentType || null,
          equipmentBrand: body.equipmentBrand || null,
          equipmentModel: body.equipmentModel || null,
          equipmentColor: body.equipmentColor || null,
          equipmentSerial: body.equipmentSerial || null,
          reportedProblem: body.reportedProblem,
          status: body.status || 'Aguardando Análise',
          priority: body.priority || 'medium',
          entryDate: body.entryDate || null,
          accessories: body.accessories || null,
          customerPassword: body.customerPassword || null,
          ramInfo: body.ramInfo || null,
          ssdInfo: body.ssdInfo || null
        })
        .select()
        .single()

      if (error) throw error
      return successResponse({ id: data.id })
    }

    // PUT /service-orders/:id - Update
    if (req.method === 'PUT' && isIdRoute) {
      const body = await req.json()

      const updateData: Record<string, any> = {}

      if (body.status !== undefined) updateData.status = body.status
      if (body.technicalAnalysis !== undefined) updateData.technicalAnalysis = body.technicalAnalysis
      if (body.servicesPerformed !== undefined) updateData.servicesPerformed = body.servicesPerformed
      if (body.services !== undefined) updateData.services = JSON.stringify(body.services)
      if (body.partsUsed !== undefined) updateData.partsUsed = JSON.stringify(body.partsUsed)
      if (body.serviceFee !== undefined) updateData.serviceFee = body.serviceFee
      if (body.totalAmount !== undefined) updateData.totalAmount = body.totalAmount
      if (body.finalObservations !== undefined) updateData.finalObservations = body.finalObservations
      if (body.analysisPrediction !== undefined) updateData.analysisPrediction = body.analysisPrediction
      if (body.customerPassword !== undefined) updateData.customerPassword = body.customerPassword
      if (body.accessories !== undefined) updateData.accessories = body.accessories
      if (body.ramInfo !== undefined) updateData.ramInfo = body.ramInfo
      if (body.ssdInfo !== undefined) updateData.ssdInfo = body.ssdInfo
      if (body.priority !== undefined) updateData.priority = body.priority
      if (body.equipmentType !== undefined) updateData.equipmentType = body.equipmentType
      if (body.equipmentBrand !== undefined) updateData.equipmentBrand = body.equipmentBrand
      if (body.equipmentModel !== undefined) updateData.equipmentModel = body.equipmentModel

      const { error } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    // DELETE /service-orders/:id - Delete
    if (req.method === 'DELETE' && isIdRoute) {
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', parseInt(id))

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Service Orders error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})