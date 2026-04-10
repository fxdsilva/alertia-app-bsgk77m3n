import { supabase } from '@/lib/supabase/client'
import { auditService } from './auditService'

export interface WorkflowComplaint {
  id: string
  protocolo: string
  status: string
  descricao: string
  escola_id: string
  created_at: string
  gravidade?: string | null
  categoria?: string[] | null
  analista_1_id?: string
  analista_2_id?: string
  analista_3_id?: string
  analista_id?: string
  parecer_1?: string
  relatorio_2?: string
  relatorio_3?: string
  tipo_resolucao?: string
  anonimo?: boolean
  denunciante_nome?: string | null
  denunciante_email?: string | null
  denunciante_telefone?: string | null
  denunciante_vinculo?: string | null
  escolas_instituicoes?: { nome_escola: string }
  analista_1?: { nome_usuario: string }
  analista_2?: { nome_usuario: string }
  analista_3?: { nome_usuario: string }
  analista?: { nome_usuario: string }
  status_denuncia?: { nome_status: string }
  _phase?: string
  record_id?: string
  is_investigacao?: boolean
}

export const WORKFLOW_STATUS = {
  REGISTERED: 'A designar',
  WAITING_ANALYST_1: 'Aguardando designação de Analista 1',
  ANALYSIS_1: 'Em análise de procedência – Analista 1',
  REVIEW_1:
    'Parecer preliminar enviado para aprovação do Diretor de Compliance',
  RETURNED_1: 'Parecer devolvido para reavaliação – Analista 1',
  ARCHIVED: 'Arquivamento aprovado',
  APPROVED_PROCEDURE:
    'Procedência aprovada – aguardando designação de Analista 2',
  INVESTIGATION_2: 'Em investigação – Analista 2',
  REVIEW_2:
    'Relatório de investigação enviado para aprovação do Diretor de Compliance',
  WAITING_ANALYST_3: 'Aguardando designação de Analista 3',
  MEDIATION_3: 'Em mediação – Analista 3',
  DISCIPLINARY_3: 'Em medida disciplinar – Analista 3',
  REVIEW_3:
    'Execução concluída – aguardando aprovação do Diretor de Compliance',
  CLOSED: 'Denúncia encerrada',
}

const mapStatus = (data: any[]) => {
  return data.map((item) => ({
    ...item,
    status: item.status_denuncia?.nome_status || item.status,
  })) as WorkflowComplaint[]
}

export const workflowService = {
  async getStatusId(statusName: string): Promise<string> {
    const { data, error } = await supabase
      .from('status_denuncia')
      .select('id')
      .ilike('nome_status', statusName)
      .limit(1)

    if (data && data.length > 0) {
      return data[0].id
    }

    console.warn(`Status "${statusName}" not found, creating...`)
    const newId = statusName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')

    const { data: existingId } = await supabase
      .from('status_denuncia')
      .select('id')
      .eq('id', newId)
      .limit(1)
    if (existingId && existingId.length > 0) return existingId[0].id

    const { data: newData, error: newError } = await supabase
      .from('status_denuncia')
      .insert({ id: newId, nome_status: statusName })
      .select('id')
      .single()

    if (newError) {
      console.error('Error creating status:', newError)
      return newId // Fallback to raw ID
    }
    return newData.id
  },

  async getComplaintsByStatus(statuses: string[]) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia!inner(nome_status), analista_1:analista_1_id(nome_usuario), analista_2:analista_2_id(nome_usuario), analista_3:analista_3_id(nome_usuario)',
      )
      .in('status_denuncia.nome_status', statuses)
      .order('created_at', { ascending: false })

    if (error) throw error
    return mapStatus(data)
  },

  async getWorkflowDashboardData() {
    const normalize = (c: any, defaultStatus: string, phase: string): any => {
      const den = c.denuncias || c
      const statusName =
        den.status_denuncia?.nome_status || den.status || defaultStatus
      return {
        ...den,
        id: den.id || c.id,
        record_id: c.id,
        status: statusName,
        _phase: phase,
        is_investigacao: !!c.denuncia_id,
        escolas_instituicoes:
          c.escolas_instituicoes || den.escolas_instituicoes,
        created_at: c.created_at || den.created_at,
        analista_1: den.analista_1,
        analista_2: den.analista_2 || (phase === 'f2' ? c.responsavel : null),
        analista_3: den.analista_3 || (phase === 'f3' ? c.responsavel : null),
        analista_id: c.analista_id || den.analista_id,
        protocolo: den.protocolo || 'S/ Protocolo',
        descricao:
          den.descricao || c.descricao || c.titulo || c.caso || 'Sem descrição',
        gravidade: den.gravidade || 'Não classificada',
        categoria: den.categoria || [],
      }
    }

    const { data: allDenuncias } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia(nome_status), analista_1:analista_1_id(nome_usuario), analista_2:analista_2_id(nome_usuario), analista_3:analista_3_id(nome_usuario)',
      )
      .order('created_at', { ascending: false })

    const { data: f2 } = await supabase
      .from('investigacoes')
      .select(
        '*, denuncias(*, status_denuncia(nome_status)), escolas_instituicoes(nome_escola), responsavel:analista_id(nome_usuario)',
      )
      .in('status', ['em_andamento', 'Pendente', 'pendente'])

    const { data: f3Proc } = await supabase
      .from('processos_disciplinares')
      .select(
        '*, denuncias(*, status_denuncia(nome_status)), escolas_instituicoes(nome_escola), responsavel:analista_id(nome_usuario)',
      )
      .not('status', 'in', '("concluido","Concluído","Encerrado")')

    const { data: f3Med } = await supabase
      .from('mediacoes')
      .select(
        '*, denuncias(*, status_denuncia(nome_status)), escolas_instituicoes(nome_escola), responsavel:analista_id(nome_usuario)',
      )
      .not('status', 'in', '("concluida","Concluída","Encerrada")')

    const f3Combined = [...(f3Proc || []), ...(f3Med || [])]

    const f1Statuses = [
      'A designar',
      'Aguardando designação de Analista 1',
      'Em análise de procedência – Analista 1',
      'Parecer preliminar enviado para aprovação do Diretor de Compliance',
      'Parecer devolvido para reavaliação – Analista 1',
      'Denúncia registrada',
      'pendente',
      'em_analise',
    ]

    const closedStatuses = [
      'resolvido',
      'arquivado',
      'Arquivamento aprovado',
      'Denúncia encerrada',
    ]

    const f1: any[] = []
    const closed: any[] = []
    const f2DenunciaIds = new Set((f2 || []).map((i) => i.denuncia_id))
    const f3DenunciaIds = new Set(f3Combined.map((i) => i.denuncia_id))

    if (allDenuncias) {
      allDenuncias.forEach((d) => {
        const sName = d.status_denuncia?.nome_status || d.status

        if (
          closedStatuses.includes(sName) ||
          closedStatuses.includes(d.status)
        ) {
          closed.push(d)
        } else if (
          f1Statuses.includes(sName) ||
          f1Statuses.includes(d.status)
        ) {
          f1.push(d)
        } else if (!f2DenunciaIds.has(d.id) && !f3DenunciaIds.has(d.id)) {
          f1.push(d)
        }
      })
    }

    return {
      f1: f1.map((x) => normalize(x, 'Pendente', 'f1')),
      f2: (f2 || []).map((x) => normalize(x, 'Em Investigação', 'f2')),
      f3: f3Combined.map((x) => normalize(x, 'Em Execução', 'f3')),
      closed: closed.map((x) => normalize(x, 'Encerrada', 'closed')),
    }
  },

  async getAnalystActiveComplaints(analystId: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia(nome_status), analista:analista_id(nome_usuario), analista_1:analista_1_id(nome_usuario), analista_2:analista_2_id(nome_usuario), analista_3:analista_3_id(nome_usuario)',
      )
      .or(
        `analista_id.eq.${analystId},analista_1_id.eq.${analystId},analista_2_id.eq.${analystId},analista_3_id.eq.${analystId}`,
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    const mappedData = mapStatus(data || [])

    return mappedData.filter((w) => {
      if (
        [WORKFLOW_STATUS.CLOSED, WORKFLOW_STATUS.ARCHIVED].includes(w.status)
      ) {
        return false
      }

      if (
        w.analista_1_id === analystId &&
        (w.status === WORKFLOW_STATUS.ANALYSIS_1 ||
          w.status === WORKFLOW_STATUS.RETURNED_1)
      ) {
        return true
      }
      if (
        w.analista_2_id === analystId &&
        w.status === WORKFLOW_STATUS.INVESTIGATION_2
      ) {
        return true
      }
      if (
        w.analista_3_id === analystId &&
        (w.status === WORKFLOW_STATUS.MEDIATION_3 ||
          w.status === WORKFLOW_STATUS.DISCIPLINARY_3)
      ) {
        return true
      }
      if (
        w.analista_id === analystId &&
        !w.analista_1_id &&
        !w.analista_2_id &&
        !w.analista_3_id
      ) {
        return true
      }
      return false
    })
  },

  async getComplaintDetails(id: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia(nome_status), analista_1:analista_1_id(nome_usuario), analista_2:analista_2_id(nome_usuario), analista_3:analista_3_id(nome_usuario)',
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return {
      ...data,
      status: data.status_denuncia?.nome_status || data.status,
    } as WorkflowComplaint
  },

  async getWorkflowLogs(complaintId: string) {
    const { data, error } = await supabase
      .from('compliance_workflow_logs')
      .select('*, changed_by_user:changed_by(nome_usuario)')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async assignAnalyst(
    complaintId: string,
    phase: 1 | 2 | 3,
    analystId: string,
    resolutionType?: 'mediacao' | 'disciplinar',
  ) {
    const updates: any = {
      analista_id: analystId,
    }
    let newStatusName = ''
    let logMsg = ''

    const { data: complaint } = await supabase
      .from('denuncias')
      .select('escola_id, protocolo, descricao')
      .eq('id', complaintId)
      .single()

    if (!complaint) throw new Error('Denúncia não encontrada')

    if (phase === 1) {
      updates.analista_1_id = analystId
      newStatusName = WORKFLOW_STATUS.ANALYSIS_1
      logMsg = 'Analista 1 (Procedência) designado'
    } else if (phase === 2) {
      updates.analista_2_id = analystId
      newStatusName = WORKFLOW_STATUS.INVESTIGATION_2
      logMsg = 'Analista 2 (Investigação) designado'

      const { data: existingInv } = await supabase
        .from('investigacoes')
        .select('id')
        .eq('denuncia_id', complaintId)
        .single()

      if (existingInv) {
        await supabase
          .from('investigacoes')
          .update({
            analista_id: analystId,
            status: 'em_andamento',
            data_inicio: new Date().toISOString(),
          })
          .eq('id', existingInv.id)
      } else {
        await supabase.from('investigacoes').insert({
          denuncia_id: complaintId,
          escola_id: complaint.escola_id,
          analista_id: analystId,
          status: 'em_andamento',
          data_inicio: new Date().toISOString(),
        })
      }
    } else if (phase === 3) {
      updates.analista_3_id = analystId
      updates.tipo_resolucao = resolutionType

      if (resolutionType === 'mediacao') {
        newStatusName = WORKFLOW_STATUS.MEDIATION_3
        logMsg = 'Analista 3 designado para Mediação'

        await supabase.from('mediacoes').insert({
          denuncia_id: complaintId,
          escola_id: complaint.escola_id,
          analista_id: analystId,
          caso: `Mediação ref. protocolo ${complaint.protocolo}`,
          status: 'Agendada',
          data_inicio: new Date().toISOString(),
          partes_envolvidas: 'A definir',
        })
      } else {
        newStatusName = WORKFLOW_STATUS.DISCIPLINARY_3
        logMsg = 'Analista 3 designado para Medida Disciplinar'

        await supabase.from('processos_disciplinares').insert({
          denuncia_id: complaintId,
          escola_id: complaint.escola_id,
          analista_id: analystId,
          titulo: `Processo ref. protocolo ${complaint.protocolo}`,
          status: 'Aberto',
          data_abertura: new Date().toISOString(),
          descricao: complaint.descricao,
        })
      }
    }

    if (newStatusName) {
      updates.status = await this.getStatusId(newStatusName)
    }

    const { error, data } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)
      .select()

    if (error) throw error
    if (!data || data.length === 0)
      throw new Error(
        'Falha ao atualizar denúncia no workflow. Verifique permissões (RLS).',
      )

    await this.logTransition(complaintId, newStatusName, logMsg)
  },

  async getAnalystVotes(complaintId: string, phase: number) {
    const { data, error } = await supabase
      .from('workflow_pareceres')
      .select('*, analista:analista_id(nome_usuario)')
      .eq('denuncia_id', complaintId)
      .eq('fase', phase)
    if (error) throw error
    return data
  },

  async submitAnalystVote(
    complaintId: string,
    phase: 1 | 2 | 3,
    analystId: string,
    conclusao: string,
    parecer_texto: string,
  ) {
    const { error } = await supabase.from('workflow_pareceres').upsert(
      {
        denuncia_id: complaintId,
        analista_id: analystId,
        fase: phase,
        conclusao,
        parecer_texto,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'denuncia_id,analista_id,fase' },
    )

    if (error) throw error

    await this.checkAndApplyConsensus(complaintId, phase)
  },

  async checkAndApplyConsensus(complaintId: string, phase: 1 | 2 | 3) {
    const complaint = await this.getComplaintDetails(complaintId)
    if (!complaint) return

    const leaderId =
      phase === 1
        ? complaint.analista_1_id
        : phase === 2
          ? complaint.analista_2_id
          : complaint.analista_3_id

    const { data: extraAnalysts } = await supabase
      .from('workflow_analistas')
      .select('analista_id')
      .eq('denuncia_id', complaintId)
      .eq('fase', phase)

    const allAssignedIds = [
      leaderId,
      ...(extraAnalysts?.map((a: any) => a.analista_id) || []),
    ].filter(Boolean)
    const uniqueAssignedIds = Array.from(new Set(allAssignedIds))

    const votes = await this.getAnalystVotes(complaintId, phase)

    if (!votes || votes.length < uniqueAssignedIds.length) {
      return // Waiting for others
    }

    let finalConclusion = ''
    let decisionType = ''

    const allConclusions = votes.map((v: any) => v.conclusao)
    const isConsensus = allConclusions.every(
      (c: string) => c === allConclusions[0],
    )

    if (isConsensus) {
      finalConclusion = allConclusions[0]
      decisionType = 'Consenso'
    } else {
      const leaderVote = votes.find((v: any) => v.analista_id === leaderId)
      if (leaderVote) {
        finalConclusion = leaderVote.conclusao
        decisionType = 'Decisão do Líder (Divergência)'
      } else {
        const counts: Record<string, number> = {}
        allConclusions.forEach(
          (c: string) => (counts[c] = (counts[c] || 0) + 1),
        )
        let max = 0
        for (const [c, count] of Object.entries(counts)) {
          if (count > max) {
            max = count
            finalConclusion = c
          }
        }
        decisionType = 'Maioria Simples (Sem Líder)'
      }
    }

    let compiledText = `[DECISÃO DA EQUIPE: ${finalConclusion} | Regra: ${decisionType}]\n\n`
    votes.forEach((v: any) => {
      const isLider = v.analista_id === leaderId ? ' (Líder)' : ''
      compiledText += `--- Parecer de ${v.analista?.nome_usuario || 'Analista'}${isLider} ---\n`
      compiledText += `Voto: ${v.conclusao}\n`
      compiledText += `Justificativa:\n${v.parecer_texto}\n\n`
    })

    if (isConsensus && phase === 1) {
      // Auto apply if consensus
      await this.saveReportDraft(complaintId, phase, compiledText)
      if (finalConclusion === 'Procedente') {
        await this.approvePhase(
          complaintId,
          1,
          true,
          `Aprovado automaticamente: ${decisionType}`,
        )
      } else if (finalConclusion === 'Improcedente') {
        await this.archiveComplaint(
          complaintId,
          `Arquivado automaticamente: ${decisionType}`,
        )
      } else {
        await this.submitReport(
          complaintId,
          phase,
          compiledText,
          finalConclusion,
        )
      }
    } else {
      // Send to director for manual review on divergence or other phases
      await this.submitReport(complaintId, phase, compiledText, finalConclusion)
    }
  },

  async saveReportDraft(
    complaintId: string,
    phase: 0 | 1 | 2 | 3,
    content: string,
  ) {
    const updates: any = {}
    if (phase === 0 || phase === 1) {
      updates.parecer_1 = content
    } else if (phase === 2) {
      updates.relatorio_2 = content
    } else if (phase === 3) {
      updates.relatorio_3 = content
    }

    const { error } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)

    if (error) throw error
  },

  async submitReport(
    complaintId: string,
    phase: 0 | 1 | 2 | 3,
    content: string,
    recommendation?: string,
  ) {
    const updates: any = {}
    let newStatusName = ''

    if (phase === 0) {
      updates.parecer_1 = content
    } else if (phase === 1) {
      updates.parecer_1 = content
      newStatusName = WORKFLOW_STATUS.REVIEW_1
    } else if (phase === 2) {
      updates.relatorio_2 = content
      newStatusName = WORKFLOW_STATUS.REVIEW_2
    } else if (phase === 3) {
      updates.relatorio_3 = content
      newStatusName = WORKFLOW_STATUS.REVIEW_3
    }

    if (newStatusName) {
      updates.status = await this.getStatusId(newStatusName)
    }

    const { error, data } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)
      .select()

    if (error) throw error
    if (!data || data.length === 0)
      throw new Error('Falha ao enviar relatório. Verifique permissões (RLS).')

    const baseMsg = `Relatório Fase ${phase} enviado/atualizado`
    const logMsg = recommendation
      ? `${baseMsg}. Recomendação: ${recommendation}`
      : baseMsg

    await this.logTransition(
      complaintId,
      newStatusName || 'Atualização de Relatório',
      logMsg,
    )
  },

  async approvePhase(
    complaintId: string,
    phase: 1 | 2 | 3,
    approved: boolean,
    comments?: string,
  ) {
    let newStatusName = ''
    const updates: any = {}

    if (phase === 1) {
      if (!approved) {
        newStatusName = WORKFLOW_STATUS.RETURNED_1
      } else {
        newStatusName = WORKFLOW_STATUS.APPROVED_PROCEDURE
        const { data: complaint } = await supabase
          .from('denuncias')
          .select('escola_id')
          .eq('id', complaintId)
          .single()

        if (complaint) {
          const { data: existing } = await supabase
            .from('investigacoes')
            .select('id')
            .eq('denuncia_id', complaintId)
            .maybeSingle()

          if (!existing) {
            await supabase.from('investigacoes').insert({
              denuncia_id: complaintId,
              escola_id: complaint.escola_id,
              analista_id: null,
              status: 'Pendente',
              created_at: new Date().toISOString(),
              data_inicio: new Date().toISOString(),
            })
          }
        }
      }
    } else if (phase === 2) {
      if (!approved) {
        newStatusName = WORKFLOW_STATUS.INVESTIGATION_2
      } else {
        newStatusName = WORKFLOW_STATUS.WAITING_ANALYST_3
      }
    } else if (phase === 3) {
      if (!approved) {
        const { data } = await supabase
          .from('denuncias')
          .select('tipo_resolucao')
          .eq('id', complaintId)
          .single()
        if (data?.tipo_resolucao === 'mediacao')
          newStatusName = WORKFLOW_STATUS.MEDIATION_3
        else newStatusName = WORKFLOW_STATUS.DISCIPLINARY_3
      } else {
        newStatusName = WORKFLOW_STATUS.CLOSED
      }
    }

    if (newStatusName === WORKFLOW_STATUS.CLOSED) {
      await this.integrateModules(complaintId)
    }

    if (newStatusName) {
      updates.status = await this.getStatusId(newStatusName)
    }

    const { error, data: updateData } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)
      .select()

    if (error) throw error
    if (!updateData || updateData.length === 0)
      throw new Error('Falha ao atualizar decisão. Verifique permissões (RLS).')

    await this.logTransition(
      complaintId,
      newStatusName,
      `Decisão Fase ${phase}: ${approved ? 'Aprovado' : 'Devolvido para Ajustes'}. ${comments || ''}`,
    )
  },

  async archiveComplaint(complaintId: string, comments: string) {
    const newStatusName = WORKFLOW_STATUS.ARCHIVED
    const statusId = await this.getStatusId(newStatusName)

    const { error, data } = await supabase
      .from('denuncias')
      .update({ status: statusId })
      .eq('id', complaintId)
      .select()

    if (error) throw error
    if (!data || data.length === 0)
      throw new Error('Falha ao arquivar denúncia. Verifique permissões (RLS).')
    await this.logTransition(
      complaintId,
      newStatusName,
      `Arquivado (Improcedente): ${comments}`,
    )
  },

  async logTransition(
    complaintId: string,
    statusName: string,
    comments: string,
  ) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const { data: current } = await supabase
      .from('denuncias')
      .select('status, status_denuncia(nome_status)')
      .eq('id', complaintId)
      .single()

    const previousName =
      current?.status_denuncia?.nome_status || 'Estado Anterior'

    await supabase.from('compliance_workflow_logs').insert({
      complaint_id: complaintId,
      new_status: statusName,
      previous_status: previousName !== statusName ? previousName : null,
      changed_by: session?.user.id,
      comments: comments,
    })

    await auditService.logAction(
      'WORKFLOW_UPDATE',
      `Status alterado para: ${statusName}`,
      'denuncias',
      { complaintId, comments, new_status: statusName },
    )
  },

  async integrateModules(complaintId: string) {
    const complaint = await this.getComplaintDetails(complaintId)
    if (!complaint) return

    await supabase.from('auditorias').insert({
      escola_id: complaint.escola_id,
      denuncia_id: complaintId,
      data_auditoria: new Date().toISOString(),
      tipo: 'Auditoria Pós-Denúncia',
      responsavel: 'Sistema (Automático)',
      status: 'Pendente',
      pendencias: 1,
    })
  },

  async deleteComplaint(complaintId: string) {
    const { error } = await supabase.rpc('delete_denuncia', {
      p_denuncia_id: complaintId,
    })
    if (error) throw error
  },
}
