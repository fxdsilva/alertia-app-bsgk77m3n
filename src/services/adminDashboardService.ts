import { supabase } from '@/lib/supabase/client'
import { startOfMonth, subMonths, format, endOfMonth, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const adminDashboardService = {
  async getKPIs() {
    // 1. Total Schools
    const { count: schoolsCount } = await supabase
      .from('escolas_instituicoes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)

    // 2. Active Users
    const { count: usersCount } = await supabase
      .from('usuarios_escola')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)

    // 3. Critical Alerts
    // High gravity complaints that are not resolved
    const { count: criticalComplaints } = await supabase
      .from('denuncias')
      .select('*', { count: 'exact', head: true })
      .in('gravidade', ['Alta', 'Gravíssima', 'Crítica'])
      .not('status', 'in', '("resolvido","concluida","arquivada","cancelada")')

    // 4. Resolution Rate
    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30).toISOString()
    const sixtyDaysAgo = subDays(now, 60).toISOString()

    // Current Period
    const { data: currentCreated } = await supabase
      .from('denuncias')
      .select('id, status')
      .gte('created_at', thirtyDaysAgo)

    const currentTotal = currentCreated?.length || 0
    const currentResolved =
      currentCreated?.filter((d) =>
        ['resolvido', 'concluida', 'arquivada'].includes(d.status),
      ).length || 0

    const currentRate =
      currentTotal > 0 ? (currentResolved / currentTotal) * 100 : 0

    // Previous Period
    const { data: prevCreated } = await supabase
      .from('denuncias')
      .select('id, status')
      .gte('created_at', sixtyDaysAgo)
      .lt('created_at', thirtyDaysAgo)

    const prevTotal = prevCreated?.length || 0
    const prevResolved =
      prevCreated?.filter((d) =>
        ['resolvido', 'concluida', 'arquivada'].includes(d.status),
      ).length || 0

    const prevRate = prevTotal > 0 ? (prevResolved / prevTotal) * 100 : 0

    const rateChange = currentRate - prevRate

    return {
      schools: schoolsCount || 0,
      users: usersCount || 0,
      activeAlerts: criticalComplaints || 0,
      resolutionRate: Math.round(currentRate),
      resolutionRateChange: Number(rateChange.toFixed(1)),
    }
  },

  async getChartsData() {
    const months = []
    for (let i = 5; i >= 0; i--) {
      months.push(subMonths(new Date(), i))
    }

    const startDate = startOfMonth(months[0]).toISOString()

    const { data: complaints } = await supabase
      .from('denuncias')
      .select('id, created_at, status, gravidade')
      .gte('created_at', startDate)
      .order('created_at')

    const chartData = months.map((date) => {
      const monthKey = format(date, 'MMM', { locale: ptBR })
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)

      const monthComplaints =
        complaints?.filter((c) => {
          const d = new Date(c.created_at)
          return d >= monthStart && d <= monthEnd
        }) || []

      const total = monthComplaints.length
      const resolved = monthComplaints.filter((c) =>
        ['resolvido', 'concluida', 'arquivada'].includes(c.status),
      ).length

      // Calculate Risk Index for this month
      // Simple logic: Base 20 + (New High Gravity * 10) + (New Med Gravity * 5) - (Resolved * 8)
      // Clamped 0-100
      let riskScore = 20 // Base risk
      monthComplaints.forEach((c) => {
        if (['Alta', 'Gravíssima', 'Crítica'].includes(c.gravidade || ''))
          riskScore += 10
        else if (['Média'].includes(c.gravidade || '')) riskScore += 5
        else riskScore += 2

        if (['resolvido', 'concluida', 'arquivada'].includes(c.status))
          riskScore -= 8
      })

      return {
        month: monthKey.charAt(0).toUpperCase() + monthKey.slice(1),
        complaints: total,
        resolved: resolved,
        risk: Math.min(Math.max(riskScore, 0), 100), // Clamp 0-100
      }
    })

    return chartData
  },

  async getRecentActivities() {
    // Combine logs and complaints
    const { data: logs } = await supabase
      .from('logs_sistema')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!logs || logs.length === 0) {
      const { data: complaints } = await supabase
        .from('denuncias')
        .select(
          'id, created_at, descricao, status, escolas_instituicoes(nome_escola)',
        )
        .order('created_at', { ascending: false })
        .limit(10)

      return (
        complaints?.map((c) => ({
          id: c.id,
          action: `Nova denúncia: ${c.status}`,
          school:
            c.escolas_instituicoes?.nome_escola || 'Escola não identificada',
          timestamp: c.created_at,
          type: 'complaint',
        })) || []
      )
    }

    return logs.map((log) => ({
      id: log.id,
      action: log.description || log.action_type,
      school:
        log.metadata &&
        typeof log.metadata === 'object' &&
        'school_name' in log.metadata
          ? (log.metadata as any).school_name
          : 'Sistema Global',
      timestamp: log.created_at,
      type: 'log',
    }))
  },
}
