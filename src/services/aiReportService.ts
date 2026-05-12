import { supabase } from '@/lib/supabase/client'

export const aiReportService = {
  async generateReport(
    scope: 'global' | 'school',
    schoolId?: string,
    sources: string[] = ['denuncias'],
  ) {
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const sourcesText = sources
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(', ')

    const title =
      scope === 'global'
        ? `Relatório Estratégico Global - ${new Date().toLocaleDateString()}`
        : `Diagnóstico Institucional - ${new Date().toLocaleDateString()}`

    const type = scope === 'global' ? 'Análise de Rede' : 'Análise Local'

    // Mock AI Content based on sources
    const highlights = []
    let riskLevel = 'Baixo'

    if (sources.includes('denuncias')) {
      highlights.push(
        'Tempo médio de resolução de denúncias reduziu em 15% no último trimestre.',
      )
      highlights.push(
        'Pico de relatos anônimos identificados no mês passado, necessitando atenção.',
      )
    }
    if (sources.includes('auditorias')) {
      highlights.push(
        '90% das não conformidades das últimas auditorias foram resolvidas.',
      )
      riskLevel = 'Moderado'
    }
    if (sources.includes('treinamentos')) {
      highlights.push(
        'Adesão aos treinamentos de Código de Conduta alcançou 95% do quadro de colaboradores.',
      )
    }
    if (sources.includes('riscos')) {
      highlights.push(
        'Dois novos riscos críticos identificados na matriz de controles internos.',
      )
      riskLevel = scope === 'global' ? 'Alto' : 'Moderado'
    }

    if (highlights.length === 0) {
      highlights.push(
        'Os indicadores mantiveram-se estáveis no período analisado.',
      )
    }

    const content = {
      summary: `Análise gerada por Inteligência Artificial baseada nas seguintes fontes de dados: ${sourcesText}. O algoritmo identificou padrões comportamentais e métricas de compliance que auxiliam na tomada de decisão da alta gestão.`,
      highlights: highlights,
      risk_assessment: riskLevel,
      recommendations:
        'Recomenda-se focar na resolução proativa dos pontos destacados, intensificar campanhas de conscientização contínuas e manter o monitoramento das áreas de maior vulnerabilidade detectadas pela análise.',
    }

    let targetSchoolId = schoolId
    if (!targetSchoolId) {
      const { data } = await supabase
        .from('escolas_instituicoes')
        .select('id')
        .limit(1)
        .single()
      targetSchoolId = data?.id
    }

    if (!targetSchoolId)
      throw new Error(
        'Não foi possível identificar uma instituição para vincular o relatório.',
      )

    const { data, error } = await supabase
      .from('relatorios_ia')
      .insert({
        escola_id: targetSchoolId,
        titulo: title,
        tipo: type,
        data_geracao: new Date().toISOString(),
        conteudo_json: content as any,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getReports(limit = 10) {
    const { data, error } = await supabase
      .from('relatorios_ia')
      .select('*, escolas_instituicoes(nome_escola)')
      .order('data_geracao', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}
