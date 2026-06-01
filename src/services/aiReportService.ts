import { supabase } from '@/lib/supabase/client'

export const aiReportService = {
  async generateReport(
    scope: 'global' | 'school',
    schoolId?: string,
    sources: string[] = ['denuncias'],
    customFilters?: any,
  ) {
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const sourcesText = sources
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(', ')

    let titleSuffix = ''
    if (customFilters?.categoria && customFilters.categoria !== 'all') {
      titleSuffix = ` - Foco: ${customFilters.categoria}`
    }

    const title =
      scope === 'global'
        ? `Relatório Estratégico Global - ${new Date().toLocaleDateString()}${titleSuffix}`
        : `Diagnóstico Institucional - ${new Date().toLocaleDateString()}${titleSuffix}`

    const type = scope === 'global' ? 'Análise de Rede' : 'Análise Local'

    // Mock AI Content based on sources
    const highlights = []
    let riskLevel = 'Baixo'

    let complaint_types = 'Não selecionado na análise.'
    let treatment_status = 'Não selecionado na análise.'
    let training_correlation = 'Não selecionado na análise.'
    let risk_matrix = 'Não selecionado na análise.'

    if (sources.includes('denuncias')) {
      if (customFilters?.categoria && customFilters.categoria !== 'all') {
        highlights.push(
          `Foco de análise direcionado para a categoria: ${customFilters.categoria}.`,
        )
      }
      highlights.push(
        'Tempo médio de resolução de denúncias analisadas reduziu em 15% no último trimestre.',
      )
      highlights.push(
        'Foram identificados padrões linguísticos específicos nas descrições recentes.',
      )
      complaint_types =
        customFilters?.categoria && customFilters.categoria !== 'all'
          ? `${customFilters.categoria} (100% da amostra filtrada).`
          : 'Assédio Moral (45%), Conduta Inadequada (30%), Desvios Éticos (25%).'
      treatment_status =
        'Aproximadamente 75% dos casos na amostra selecionada foram apurados e arquivados/resolvidos no prazo legal. 25% encontram-se em fase de investigação aprofundada ou due diligence.'
    }

    if (sources.includes('treinamentos')) {
      highlights.push(
        'Adesão aos treinamentos de Código de Conduta alcançou 95% do quadro de colaboradores.',
      )
      if (sources.includes('denuncias')) {
        training_correlation =
          'Identificada correlação positiva: após a campanha de treinamento sobre "Prevenção ao Assédio", houve um pico de notificações seguido de uma queda progressiva nos incidentes nos meses subsequentes.'
      } else {
        training_correlation =
          'Treinamentos de compliance foram efetivos, atingindo as metas de conformidade do semestre.'
      }
    }

    if (sources.includes('riscos')) {
      highlights.push(
        'Dois novos riscos críticos identificados na matriz de controles internos.',
      )
      riskLevel = scope === 'global' ? 'Alto' : 'Moderado'
      risk_matrix = `Matriz de risco indica exposição ${riskLevel.toUpperCase()} para falhas de conduta e desvios éticos em áreas operacionais. Novos planos de mitigação foram propostos e estão sendo monitorados pela equipe de compliance.`
    }

    if (sources.includes('auditorias')) {
      highlights.push(
        '90% das não conformidades das últimas auditorias foram resolvidas.',
      )
      if (riskLevel === 'Baixo') riskLevel = 'Moderado'
    }

    if (highlights.length === 0) {
      highlights.push(
        'Os indicadores mantiveram-se estáveis no período analisado.',
      )
    }

    const content = {
      summary: `Análise gerada por Inteligência Artificial baseada nas seguintes fontes de dados: ${sourcesText}. O algoritmo identificou padrões comportamentais e métricas de compliance que auxiliam na tomada de decisão da alta gestão.`,
      highlights: highlights,
      complaint_types,
      treatment_status,
      training_correlation,
      risk_matrix,
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

  async deleteReport(id: string) {
    const { error } = await supabase.from('relatorios_ia').delete().eq('id', id)
    if (error) throw error
  },
}
