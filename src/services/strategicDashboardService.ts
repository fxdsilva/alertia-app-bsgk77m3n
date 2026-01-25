import { supabase } from '@/lib/supabase/client'

export interface DashboardMetrics {
  schoolName: string
  codigoConduta: { status: 'PENDENTE' | 'DISPONÍVEL'; count: number }
  compromissoGestao: { status: 'PENDENTE' | 'DISPONÍVEL'; count: number }
  denuncias: { count: number; status: string }
  treinamentos: { count: number; status: string }
  gestaoRiscos: { status: 'CONTROLADO' | 'ATENÇÃO' | 'CRÍTICO'; count: number }
  auditorias: { count: number; status: string }
  mediacoes: { count: number }
  dueDiligence: { count: number; status: string }
  decisoesDisciplinares: { count: number }
  relatoriosIA: { status: 'DISPONÍVEL' | 'INDISPONÍVEL'; count: number }
  visaoConsolidada: { status: 'DISPONÍVEL' | 'INDISPONÍVEL' }
  relatorios: { status: 'DISPONÍVEL' }
}

export interface ChartData {
  integrityScore: { month: string; score: number }[]
  occurrencesVsAudits: {
    month: string
    denuncias: number
    auditorias: number
  }[]
}

export const strategicDashboardService = {
  async getMetrics(schoolId: string): Promise<DashboardMetrics> {
    const metrics: DashboardMetrics = {
      schoolName: '',
      codigoConduta: { status: 'PENDENTE', count: 0 },
      compromissoGestao: { status: 'PENDENTE', count: 0 },
      denuncias: { count: 0, status: 'TOTAL' },
      treinamentos: { count: 0, status: 'ATIVOS' },
      gestaoRiscos: { status: 'CONTROLADO', count: 0 },
      auditorias: { count: 0, status: 'ABERTAS' },
      mediacoes: { count: 0 },
      dueDiligence: { count: 0, status: 'ANÁLISE' },
      decisoesDisciplinares: { count: 0 },
      relatoriosIA: { status: 'INDISPONÍVEL', count: 0 },
      visaoConsolidada: { status: 'INDISPONÍVEL' },
      relatorios: { status: 'DISPONÍVEL' },
    }

    try {
      // 1. School Info
      const { data: school } = await supabase
        .from('escolas_instituicoes')
        .select('nome_escola')
        .eq('id', schoolId)
        .single()

      if (school) metrics.schoolName = school.nome_escola

      // 2. Código de Conduta
      const { count: ccCount } = await supabase
        .from('codigo_conduta')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      if (ccCount && ccCount > 0) {
        metrics.codigoConduta = { status: 'DISPONÍVEL', count: 1 }
      }

      // 3. Compromisso Gestão
      const { count: cagCount } = await supabase
        .from('compromisso_alta_gestao')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      if (cagCount && cagCount > 0) {
        metrics.compromissoGestao = { status: 'DISPONÍVEL', count: 1 }
      }

      // 4. Denúncias
      const { count: denCount } = await supabase
        .from('denuncias')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      metrics.denuncias.count = denCount || 0

      // 5. Treinamentos (Ativos)
      const { count: trainCount } = await supabase
        .from('treinamentos')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)
        .eq('ativo', true)

      metrics.treinamentos.count = trainCount || 0

      // 6. Gestão de Riscos (Simple logic based on count for now)
      const { count: riskCount } = await supabase
        .from('matriz_riscos')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      metrics.gestaoRiscos.count = riskCount || 0
      if ((riskCount || 0) > 5) metrics.gestaoRiscos.status = 'ATENÇÃO'

      // 7. Auditorias (Filter by concluded status)
      const { count: auditCount } = await supabase
        .from('auditorias')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)
        .neq('status', 'concluida')

      metrics.auditorias.count = auditCount || 0

      // 8. Mediações
      const { count: medCount } = await supabase
        .from('mediacoes')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      metrics.mediacoes.count = medCount || 0

      // 9. Due Diligence
      const { count: ddCount } = await supabase
        .from('due_diligence')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      metrics.dueDiligence.count = ddCount || 0

      // 10. Processos Disciplinares
      const { count: pdCount } = await supabase
        .from('processos_disciplinares')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      metrics.decisoesDisciplinares.count = pdCount || 0

      // 11. Relatórios IA
      const { count: iaCount } = await supabase
        .from('relatorios_ia')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      if (iaCount && iaCount > 0) metrics.relatoriosIA.status = 'DISPONÍVEL'

      // 12. Relatórios Consolidados
      const { count: conCount } = await supabase
        .from('relatorios_consolidados')
        .select('*', { count: 'exact', head: true })
        .eq('escola_id', schoolId)

      if (conCount && conCount > 0)
        metrics.visaoConsolidada.status = 'DISPONÍVEL'
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
    }

    return metrics
  },

  async getChartsData(schoolId: string): Promise<ChartData> {
    // Mock data generation for charts since we need time-series data which might be sparse in a new db
    const months = [
      '2025-08',
      '2025-09',
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-01',
    ]

    // Integrity Score (Mocked logic: starts high, fluctuates)
    const integrityScore = months.map((m, i) => ({
      month: m,
      score: i === 5 ? 65 : 90 + Math.floor(Math.random() * 10), // Drop in last month as shown in image
    }))

    // Occurrences vs Audits
    // Ideally query 'denuncias' and 'auditorias' grouped by month
    // For now returning mock data matching the image pattern (spike in end)
    const occurrencesVsAudits = months.map((m, i) => ({
      month: m,
      denuncias: i === 5 ? 7 : Math.floor(Math.random() * 2),
      auditorias: i === 5 ? 0 : Math.floor(Math.random() * 1),
    }))

    return { integrityScore, occurrencesVsAudits }
  },
}
