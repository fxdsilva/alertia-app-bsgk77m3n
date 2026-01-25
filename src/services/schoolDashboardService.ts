import { supabase } from '@/lib/supabase/client'

export interface DashboardMetrics {
  codigoConduta: { status: 'Concluído' | 'Pendente'; lastUpdated?: string }
  compromissoGestao: { status: 'Concluído' | 'Pendente'; lastUpdated?: string }
  denuncias: { total: number; active: number }
  relatorios: { available: boolean }
  treinamentos: { active: number }
  riscos: { level: 'Baixo' | 'Médio' | 'Alto' | 'Crítico' }
  auditorias: { open: number }
  mediacoes: { count: number }
  dueDiligence: { status: 'Em Análise' | 'Concluído' | 'Pendente' }
  decisoes: { count: number }
  relatoriosIA: { available: boolean }
  visaoConsolidada: { status: 'Geral' | 'Alerta' }
}

export interface ChartData {
  date: string
  score: number
  denuncias: number
  auditorias: number
}

export const schoolDashboardService = {
  async getMetrics(schoolId: string): Promise<DashboardMetrics> {
    try {
      // 1. Código de Conduta
      const { data: code } = await supabase
        .from('codigo_conduta')
        .select('updated_at')
        .eq('escola_id', schoolId)
        .single()

      // 2. Compromisso
      const { data: commitment } = await supabase
        .from('compromisso_alta_gestao')
        .select('updated_at')
        .eq('escola_id', schoolId)
        .single()

      // 3. Denúncias
      const { count: totalDenuncias } = await supabase
        .from('denuncias')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      const { count: activeDenuncias } = await supabase
        .from('denuncias')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)
        .in('status', ['pendente', 'em_analise', 'investigacao'])

      // 4. Relatórios Consolidados
      const { count: reportsCount } = await supabase
        .from('relatorios_consolidados')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      // 5. Treinamentos
      const { count: activeTrainings } = await supabase
        .from('treinamentos')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)
        .eq('ativo', true)

      // 6. Riscos (Simulated calc based on Matriz)
      const { data: risks } = await supabase
        .from('matriz_riscos')
        .select('nivel_risco_calculado')
        .eq('escola_id', schoolId)
        .limit(1)
        .order('created_at', { ascending: false })

      const riskLevel = (risks?.[0]?.nivel_risco_calculado as any) || 'Baixo'

      // 7. Auditorias
      const { count: openAudits } = await supabase
        .from('auditorias')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)
        .neq('status', 'Concluída')

      // 8. Mediações
      const { count: mediationsCount } = await supabase
        .from('mediacoes')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      // 9. Due Diligence
      const { data: dd } = await supabase
        .from('due_diligence')
        .select('status')
        .eq('escola_id', schoolId)
        .limit(1)
        .order('created_at', { ascending: false })

      const ddStatus = (dd?.[0]?.status as any) || 'Pendente'

      // 10. Decisões Disciplinares
      const { count: decisionsCount } = await supabase
        .from('processos_disciplinares')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      // 11. Relatórios IA
      const { count: iaCount } = await supabase
        .from('relatorios_ia')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      return {
        codigoConduta: {
          status: code ? 'Concluído' : 'Pendente',
          lastUpdated: code?.updated_at,
        },
        compromissoGestao: {
          status: commitment ? 'Concluído' : 'Pendente',
          lastUpdated: commitment?.updated_at,
        },
        denuncias: {
          total: totalDenuncias || 0,
          active: activeDenuncias || 0,
        },
        relatorios: { available: (reportsCount || 0) > 0 },
        treinamentos: { active: activeTrainings || 0 },
        riscos: { level: riskLevel },
        auditorias: { open: openAudits || 0 },
        mediacoes: { count: mediationsCount || 0 },
        dueDiligence: { status: ddStatus },
        decisoes: { count: decisionsCount || 0 },
        relatoriosIA: { available: (iaCount || 0) > 0 },
        visaoConsolidada: { status: 'Geral' },
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      throw error
    }
  },

  async getChartData(schoolId: string): Promise<ChartData[]> {
    // Mocking chart data for now as historical data might not be fully available in simple tables
    // In a real scenario, we would aggregate data from 'denuncias', 'auditorias' and history tables.
    const months = ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01']
    
    return months.map(date => ({
      date,
      score: Math.floor(Math.random() * (100 - 60) + 60), // Random score between 60-100
      denuncias: Math.floor(Math.random() * 10),
      auditorias: Math.floor(Math.random() * 2)
    }))
  }
}
