import { supabase } from '@/lib/supabase/client'

export const aiReportService = {
  async generateReport(scope: 'global' | 'school', schoolId?: string) {
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const title =
      scope === 'global'
        ? `Relatório Consolidado da Rede - ${new Date().toLocaleDateString()}`
        : `Relatório de Integridade Escolar - ${new Date().toLocaleDateString()}`

    const type = scope === 'global' ? 'Consolidado Rede' : 'Diagnóstico Escolar'

    // Mock AI Content
    const content = {
      summary:
        'Análise baseada nos indicadores de integridade e compliance do período.',
      highlights: [
        'Aumento de 10% na eficiência de resolução de casos.',
        'Identificação de novos focos de risco em áreas administrativas.',
        'Adesão aos treinamentos acima da média esperada.',
      ],
      risk_assessment: scope === 'global' ? 'Moderado' : 'Baixo',
      recommendations:
        'Recomenda-se intensificar as ações de conscientização sobre assédio moral.',
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

  async getReports(limit = 5) {
    const { data, error } = await supabase
      .from('relatorios_ia')
      .select('*, escolas_instituicoes(nome_escola)')
      .order('data_geracao', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}
