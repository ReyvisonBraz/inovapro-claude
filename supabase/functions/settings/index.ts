import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    // GET /settings
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        // Convert showWarnings to boolean
        const response = {
          ...data,
          showWarnings: data.showWarnings ? true : false
        }
        // Parse hiddenColumns if string
        if (typeof response.hiddenColumns === 'string') {
          try {
            response.hiddenColumns = JSON.parse(response.hiddenColumns)
          } catch (e) {
            response.hiddenColumns = []
          }
        }
        return successResponse(response)
      }

      return successResponse(null)
    }

    // POST /settings - Update
    if (req.method === 'POST') {
      const body = await req.json()

      const updateData: Record<string, any> = {}

      if (body.appName !== undefined) updateData.appName = body.appName
      if (body.appVersion !== undefined) updateData.appVersion = body.appVersion
      if (body.fiscalYear !== undefined) updateData.fiscalYear = body.fiscalYear
      if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor
      if (body.categories !== undefined) updateData.categories = body.categories
      if (body.incomeCategories !== undefined) updateData.incomeCategories = body.incomeCategories
      if (body.expenseCategories !== undefined) updateData.expenseCategories = body.expenseCategories
      if (body.profileName !== undefined) updateData.profileName = body.profileName
      if (body.profileAvatar !== undefined) updateData.profileAvatar = body.profileAvatar
      if (body.initialBalance !== undefined) updateData.initialBalance = body.initialBalance
      if (body.showWarnings !== undefined) updateData.showWarnings = body.showWarnings ? 1 : 0
      if (body.hiddenColumns !== undefined) updateData.hiddenColumns = JSON.stringify(body.hiddenColumns)
      if (body.settingsPassword !== undefined) updateData.settingsPassword = body.settingsPassword
      if (body.receiptLayout !== undefined) updateData.receiptLayout = body.receiptLayout
      if (body.receiptLogo !== undefined) updateData.receiptLogo = body.receiptLogo
      if (body.companyCnpj !== undefined) updateData.companyCnpj = body.companyCnpj
      if (body.companyAddress !== undefined) updateData.companyAddress = body.companyAddress
      if (body.pixKey !== undefined) updateData.pixKey = body.pixKey
      if (body.pixQrCode !== undefined) updateData.pixQrCode = body.pixQrCode
      if (body.whatsappBillingTemplate !== undefined) updateData.whatsappBillingTemplate = body.whatsappBillingTemplate
      if (body.whatsappOSTemplate !== undefined) updateData.whatsappOSTemplate = body.whatsappOSTemplate
      if (body.sendPulseClientId !== undefined) updateData.sendPulseClientId = body.sendPulseClientId
      if (body.sendPulseClientSecret !== undefined) updateData.sendPulseClientSecret = body.sendPulseClientSecret
      if (body.sendPulseTemplateId !== undefined) updateData.sendPulseTemplateId = body.sendPulseTemplateId

      const { error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', 1)

      if (error) throw error
      return successResponse({ success: true })
    }

    return errorResponse('Método não permitido', 405)

  } catch (error) {
    console.error('Settings error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})