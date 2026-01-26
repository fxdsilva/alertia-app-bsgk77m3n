import { supabase } from '@/lib/supabase/client'
import { auditService } from './auditService'

export interface WorkflowComplaint {
  id: string
  protocolo: string
  status: string
  descricao: string
  escola_id: string
  created_at: string
  analista_1_id?: string
  analista_2_id?: string
  analista_3_id?: string
  parecer_1?: string
  relatorio_2?: string
  relatorio_3?: string
  tipo_resolucao?: string
  escolas_instituicoes?: { nome_escola: string }
  analista_1?: { nome_usuario: string }
  analista_2?: { nome_usuario: string }
  analista_3?: { nome_usuario: string }
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

export const workflowService = {
  async getComplaintsByStatus(statuses: string[]) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), analista_1:analista_1_id(nome_usuario), analista_2:analista_2_id(nome_usuario), analista_3:analista_3_id(nome_usuario)',
      )
      .in('status', statuses)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as WorkflowComplaint[]
  },

  async getComplaintDetails(id: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), analista_1:analista_1_id(nome_usuario), analista_2:analista_2_id(nome_usuario), analista_3:analista_3_id(nome_usuario)',
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data as WorkflowComplaint
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
    let newStatus = ''
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
      newStatus = WORKFLOW_STATUS.ANALYSIS_1
      logMsg = 'Analista 1 (Procedência) designado'
    } else if (phase === 2) {
      updates.analista_2_id = analystId
      newStatus = WORKFLOW_STATUS.INVESTIGATION_2
      logMsg = 'Analista 2 (Investigação) designado'

      // Create Investigation Record
      await supabase.from('investigacoes').insert({
        denuncia_id: complaintId,
        escola_id: complaint.escola_id,
        analista_id: analystId,
        status: 'em_andamento',
        data_inicio: new Date().toISOString(),
      })
    } else if (phase === 3) {
      updates.analista_3_id = analystId
      updates.tipo_resolucao = resolutionType

      if (resolutionType === 'mediacao') {
        newStatus = WORKFLOW_STATUS.MEDIATION_3
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
        newStatus = WORKFLOW_STATUS.DISCIPLINARY_3
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

    updates.status = newStatus

    const { error } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)

    if (error) throw error

    await this.logTransition(complaintId, newStatus, logMsg)
  },

  async submitReport(complaintId: string, phase: 1 | 2 | 3, content: string) {
    const updates: any = {}
    let newStatus = ''

    if (phase === 1) {
      updates.parecer_1 = content
      newStatus = WORKFLOW_STATUS.REVIEW_1
    } else if (phase === 2) {
      updates.relatorio_2 = content
      newStatus = WORKFLOW_STATUS.REVIEW_2
    } else if (phase === 3) {
      updates.relatorio_3 = content
      newStatus = WORKFLOW_STATUS.REVIEW_3
    }

    updates.status = newStatus

    const { error } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)

    if (error) throw error

    await this.logTransition(
      complaintId,
      newStatus,
      `Relatório Fase ${phase} enviado para aprovação`,
    )
  },

  async approvePhase(
    complaintId: string,
    phase: 1 | 2 | 3,
    approved: boolean,
    comments?: string,
  ) {
    let newStatus = ''
    const updates: any = {}

    if (phase === 1) {
      if (!approved) {
        newStatus = WORKFLOW_STATUS.RETURNED_1
      } else {
        newStatus = WORKFLOW_STATUS.APPROVED_PROCEDURE
      }
    } else if (phase === 2) {
      if (!approved) {
        // If rejected, usually goes back to investigation or returned. Assuming returned to investigation for simplicity or logic can be complex.
        // For this implementation, let's assume we return to investigation status so analyst can edit.
        newStatus = WORKFLOW_STATUS.INVESTIGATION_2
        // NOTE: In real world, might need a specific 'RETURNED_2' status, but reusing active status allows editing.
      } else {
        newStatus = WORKFLOW_STATUS.WAITING_ANALYST_3
      }
    } else if (phase === 3) {
      if (!approved) {
        // Return to active phase 3 based on type
        const { data } = await supabase
          .from('denuncias')
          .select('tipo_resolucao')
          .eq('id', complaintId)
          .single()
        if (data?.tipo_resolucao === 'mediacao')
          newStatus = WORKFLOW_STATUS.MEDIATION_3
        else newStatus = WORKFLOW_STATUS.DISCIPLINARY_3
      } else {
        newStatus = WORKFLOW_STATUS.CLOSED
      }
    }

    if (newStatus === WORKFLOW_STATUS.CLOSED) {
      await this.integrateModules(complaintId)
    }

    updates.status = newStatus
    const { error } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)

    if (error) throw error

    await this.logTransition(
      complaintId,
      newStatus,
      `Decisão Fase ${phase}: ${approved ? 'Aprovado' : 'Revisão Solicitada'}. ${comments || ''}`,
    )
  },

  async archiveComplaint(complaintId: string, comments: string) {
    const newStatus = WORKFLOW_STATUS.ARCHIVED
    const { error } = await supabase
      .from('denuncias')
      .update({ status: newStatus })
      .eq('id', complaintId)

    if (error) throw error
    await this.logTransition(
      complaintId,
      newStatus,
      `Arquivado (Improcedente): ${comments}`,
    )
  },

  async logTransition(complaintId: string, status: string, comments: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get previous status for the record
    const { data: current } = await supabase
      .from('denuncias')
      .select('status')
      .eq('id', complaintId)
      .single()
    const previous = current?.status || 'Unknown'

    await supabase.from('compliance_workflow_logs').insert({
      complaint_id: complaintId,
      new_status: status,
      previous_status: previous !== status ? previous : null, // best effort
      changed_by: session?.user.id,
      comments: comments,
    })

    // Also log to main audit
    await auditService.logAction(
      'WORKFLOW_UPDATE',
      `Status alterado para: ${status}`,
      'denuncias',
      { complaintId, comments, new_status: status },
    )
  },

  async integrateModules(complaintId: string) {
    const complaint = await this.getComplaintDetails(complaintId)
    if (!complaint) return

    // 1. Audit - Link via denuncia_id
    await supabase.from('auditorias').insert({
      escola_id: complaint.escola_id,
      denuncia_id: complaintId,
      data_auditoria: new Date().toISOString(),
      tipo: 'Auditoria Pós-Denúncia',
      responsavel: 'Sistema (Automático)',
      status: 'Pendente',
      pendencias: 1,
    })

    // 2. Risks - Link via denuncia_id
    await supabase.from('matriz_riscos').insert({
      escola_id: complaint.escola_id,
      denuncia_id: complaintId,
      risco: `Risco materializado: Denúncia ${complaint.protocolo}`,
      probabilidade: 'Alta', // Already happened
      impacto: 'Alto',
      nivel_risco_calculado: 'Crítico',
      plano_mitigacao: 'Revisão de processos conforme relatório de denúncia.',
    })

    // 3. Internal Controls - Link via denuncia_id
    await supabase.from('controles_internos').insert({
      titulo: `Controle Preventivo - ${complaint.protocolo}`,
      descricao: `Revisão de controles falhos identificados na denúncia ${complaint.protocolo}`,
      status: 'Aberto',
      denuncia_id: complaintId,
      data_teste: new Date().toISOString(),
    })
  },
}
