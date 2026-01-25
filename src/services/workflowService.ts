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

  async assignAnalyst(
    complaintId: string,
    phase: 1 | 2 | 3,
    analystId: string,
    resolutionType?: 'mediacao' | 'disciplinar',
  ) {
    const updates: any = {}
    let newStatus = ''
    let logMsg = ''

    if (phase === 1) {
      updates.analista_1_id = analystId
      newStatus = WORKFLOW_STATUS.ANALYSIS_1
      logMsg = 'Analista 1 designado'
    } else if (phase === 2) {
      updates.analista_2_id = analystId
      newStatus = WORKFLOW_STATUS.INVESTIGATION_2
      logMsg = 'Analista 2 designado'
    } else if (phase === 3) {
      updates.analista_3_id = analystId
      updates.tipo_resolucao = resolutionType
      newStatus =
        resolutionType === 'mediacao'
          ? WORKFLOW_STATUS.MEDIATION_3
          : WORKFLOW_STATUS.DISCIPLINARY_3
      logMsg = `Analista 3 designado para ${resolutionType}`
    }

    updates.status = newStatus

    const { error } = await supabase
      .from('denuncias')
      .update(updates)
      .eq('id', complaintId)

    if (error) throw error

    await this.logTransition(complaintId, newStatus, logMsg)
  },

  async submitReport(
    complaintId: string,
    phase: 1 | 2 | 3,
    content: string,
    classification?: string, // For phase 1: Procedente/Improcedente
  ) {
    const updates: any = {}
    let newStatus = ''

    if (phase === 1) {
      updates.parecer_1 = content
      // If classification is part of the content or separate, here assuming we just move to review
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
      `Relatório Fase ${phase} enviado`,
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
        // Here we need to know if it was "Procedente" or "Improcedente"
        // Assuming the Director decides this based on the report.
        // For simplicity, we pass a specific approved status or use the comments to guide logic
        // But the requirement says Director approves "Improcedente" OR "Procedente"
        // Let's assume 'approved' true means "Procedente" flow, false means return?
        // Actually, let's allow setting status directly or use a specific param.
        // Simplified:
        // True -> Procedente (Next Phase)
        // False -> Return
        // We need a way to archive (Improcedente).
        // Let's assume we handle archiving separately or via a specific call.
        newStatus = WORKFLOW_STATUS.APPROVED_PROCEDURE
      }
    } else if (phase === 2) {
      // Approve investigation -> Go to Phase 3 choice
      newStatus = WORKFLOW_STATUS.WAITING_ANALYST_3
    } else if (phase === 3) {
      // Approve execution -> Close
      newStatus = WORKFLOW_STATUS.CLOSED
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
      `Aprovação Fase ${phase}: ${approved ? 'Sim' : 'Não'}. ${comments || ''}`,
    )
  },

  async archiveComplaint(complaintId: string, comments: string) {
    const newStatus = WORKFLOW_STATUS.ARCHIVED
    const { error } = await supabase
      .from('denuncias')
      .update({ status: newStatus })
      .eq('id', complaintId)

    if (error) throw error
    await this.logTransition(complaintId, newStatus, `Arquivado: ${comments}`)
  },

  async logTransition(complaintId: string, status: string, comments: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    await supabase.from('compliance_workflow_logs').insert({
      complaint_id: complaintId,
      new_status: status,
      changed_by: session?.user.id,
      comments: comments,
    })
    // Also log to main audit
    await auditService.logAction(
      'WORKFLOW_UPDATE',
      `Status alterado para: ${status}`,
      'denuncias',
      { complaintId, comments },
    )
  },

  async integrateModules(complaintId: string) {
    const complaint = await this.getComplaintDetails(complaintId)
    if (!complaint) return

    // 1. Audit
    await supabase.from('auditorias').insert({
      escola_id: complaint.escola_id,
      data_auditoria: new Date().toISOString(),
      tipo: 'Pós-Denúncia',
      responsavel: 'Sistema (Integração)',
      status: 'Gerada Automaticamente',
    })

    // 2. Risks
    await supabase.from('matriz_riscos').insert({
      escola_id: complaint.escola_id,
      risco: `Risco identificado na denúncia ${complaint.protocolo}`,
      probabilidade: 'Alta',
      impacto: 'Alto',
    })

    // 3. Internal Controls
    await supabase.from('controles_internos').insert({
      titulo: `Controle pós-denúncia ${complaint.protocolo}`,
      status: 'Pendente',
      data_teste: new Date().toISOString(),
    })
  },
}
