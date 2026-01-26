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
}

export const WORKFLOW_STATUS = {
  REGISTERED: 'Denúncia registrada',
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
      .eq('nome_status', statusName)
      .single()

    if (error || !data) {
      console.warn(`Status "${statusName}" not found, creating...`)
      // Fallback: create if not exists (should be seeded, but safe fallback)
      const { data: newData, error: newError } = await supabase
        .from('status_denuncia')
        .insert({ nome_status: statusName })
        .select('id')
        .single()
      if (newError) throw newError
      return newData.id
    }
    return data.id
  },

  async getComplaintsByStatus(statuses: string[]) {
    // We filter by the joined table nome_status
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

    // Filter to ensure we only return complaints where the specific analyst is CURRENTLY responsible
    return mappedData.filter((w) => {
      // Exclude closed/archived
      if (
        [WORKFLOW_STATUS.CLOSED, WORKFLOW_STATUS.ARCHIVED].includes(w.status)
      ) {
        return false
      }

      // Phase 1: Analysis
      if (
        w.analista_1_id === analystId &&
        (w.status === WORKFLOW_STATUS.ANALYSIS_1 ||
          w.status === WORKFLOW_STATUS.RETURNED_1)
      ) {
        return true
      }
      // Phase 2: Investigation
      if (
        w.analista_2_id === analystId &&
        w.status === WORKFLOW_STATUS.INVESTIGATION_2
      ) {
        return true
      }
      // Phase 3: Mediation or Disciplinary
      if (
        w.analista_3_id === analystId &&
        (w.status === WORKFLOW_STATUS.MEDIATION_3 ||
          w.status === WORKFLOW_STATUS.DISCIPLINARY_3)
      ) {
        return true
      }
      // Generic / Legacy Assignment
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
    const updates: any = {}
    let newStatusName = ''
    let logMsg = ''

    // Fetch complaint to get school_id
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

      // Check if investigation record exists (possibly created by Director approval)
      const { data: existingInv } = await supabase
        .from('investigacoes')
        .select('id')
        .eq('denuncia_id', complaintId)
        .single()

      if (existingInv) {
        // Update existing investigation
        await supabase
          .from('investigacoes')
          .update({
            analista_id: analystId,
            status: 'em_andamento',
            data_inicio: new Date().toISOString(),
          })
          .eq('id', existingInv.id)
      } else {
        // Create Investigation Record (Fallback)
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

        // Create Mediation Record
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

        // Create Disciplinary Process Record
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

    const { error } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)

    if (error) throw error

    await this.logTransition(complaintId, newStatusName, logMsg)
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
      // Keep generic status or move to review if logic existed
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

    const { error } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)

    if (error) throw error

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
        // Create Investigation Record (Placeholder for Phase 2)
        // Fetch school_id first
        const { data: complaint } = await supabase
          .from('denuncias')
          .select('escola_id')
          .eq('id', complaintId)
          .single()

        if (complaint) {
          // Check if already exists to avoid dupes
          const { data: existing } = await supabase
            .from('investigacoes')
            .select('id')
            .eq('denuncia_id', complaintId)
            .maybeSingle()

          if (!existing) {
            await supabase.from('investigacoes').insert({
              denuncia_id: complaintId,
              escola_id: complaint.escola_id,
              analista_id: null, // No analyst assigned yet
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

    const { error } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)

    if (error) throw error

    await this.logTransition(
      complaintId,
      newStatusName,
      `Decisão Fase ${phase}: ${approved ? 'Aprovado' : 'Devolvido para Ajustes'}. ${comments || ''}`,
    )
  },

  async archiveComplaint(complaintId: string, comments: string) {
    const newStatusName = WORKFLOW_STATUS.ARCHIVED
    const statusId = await this.getStatusId(newStatusName)

    const { error } = await supabase
      .from('denuncias')
      .update({ status: statusId })
      .eq('id', complaintId)

    if (error) throw error
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

    // Get previous status name for log
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
      status: 'Pendente', // Ideally fetch ID if audit status is also FK
      pendencias: 1,
    })

    // ... other integrations
  },
}
