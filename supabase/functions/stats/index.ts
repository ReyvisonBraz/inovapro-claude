import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase, corsHeaders, errorResponse, successResponse } from '../_shared/database.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  if (req.method !== 'GET') {
    return errorResponse('Método não permitido', 405)
  }

  try {
    // Calculate 12 months ago
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0]

    // Get totals
    const { data: incomeData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'income')

    const { data: expenseData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'expense')

    const totalIncome = incomeData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
    const totalExpenses = expenseData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    // Pending payments
    const { count: pendingPayments } = await supabase
      .from('client_payments')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'paid')

    // Active service orders
    const { count: activeOS } = await supabase
      .from('service_orders')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '("Concluído","Entregue","canceled")')

    // Monthly chart data
    const { data: monthlyTx } = await supabase
      .from('transactions')
      .select('date, type, amount')
      .gte('date', twelveMonthsAgoStr)

    // Group by month
    const byMonth: Record<string, { income: number; expense: number }> = {}
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const month = d.toISOString().slice(0, 7)
      byMonth[month] = { income: 0, expense: 0 }
    }

    for (const tx of monthlyTx || []) {
      const month = tx.date.substring(0, 7)
      if (byMonth[month]) {
        if (tx.type === 'income') {
          byMonth[month].income += tx.amount || 0
        } else {
          byMonth[month].expense += tx.amount || 0
        }
      }
    }

    const chartData = []
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const month = d.toISOString().slice(0, 7)
      const name = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
      chartData.push({
        name,
        income: byMonth[month]?.income || 0,
        expense: byMonth[month]?.expense || 0
      })
    }

    // Category rankings
    const { data: incomeTx } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('type', 'income')

    const { data: expenseTx } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('type', 'expense')

    const incomeByCategory: Record<string, number> = {}
    const expenseByCategory: Record<string, number> = {}

    for (const tx of incomeTx || []) {
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + (tx.amount || 0)
    }
    for (const tx of expenseTx || []) {
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + (tx.amount || 0)
    }

    const sortedIncomeRanking = Object.entries(incomeByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => [category, total])

    const sortedExpenseRanking = Object.entries(expenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => [category, total])

    return successResponse({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      pendingPayments: pendingPayments || 0,
      activeOS: activeOS || 0,
      chartData,
      sortedIncomeRanking,
      sortedExpenseRanking
    })

  } catch (error) {
    console.error('Stats error:', error)
    return errorResponse(error.message || 'Erro interno', 500)
  }
})