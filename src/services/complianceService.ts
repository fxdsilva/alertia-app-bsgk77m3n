import { supabase } from '@/lib/supabase/client'
import { auditService } from './auditService'
import { workflowService, WORKFLOW_STATUS } from './workflowService'

export interface ComplianceTask {
  id: string
  analista_id: string
  secondary_analyst_id?: string
  diretor_id: string
  escola_id?: string
  referencia_id: string | null
  tipo_modulo: string
  pillar?: string
  status: string
  prazo: string | null
  nivel_risco?: string | null
  descricao: string | null
  guideline?: string
  correction_notes?: string
  response_text?: string
  proposed_complaint_status?: string
  created_at: string
  updated_at?: string
  data_conclusao?: string
  analyst?: {
    nome_usuario: string
    email: string
  }
  secondary_analyst?: {
    nome_usuario: string
    email: string
  }
  school?: {
    nome_escola: string
  }
  protocol?: string
  institutional_docs_auth?: boolean
  doc_permissions?: {
    code_of_conduct: boolean
    commitment_term: boolean
    consolidated_report: boolean
  }
  escolas_instituicoes?: {
    nome_escola: string
  }
}

export interface TaskEvidence {
  id: string
  task_id: string
  url: string
  description: string
  uploaded_by: string
  created_at: string
}

export interface InternalControl {
  id: string
  titulo: string
  descricao: string | null
  data_teste: string | null
  resultado_teste: string | null
  plano_acao: string | null
  status: string
  analista_id: string | null
  created_at: string
}

export interface UnifiedTask {
  id: string
  type: 'compliance_task' | 'direct_assignment'
  module: string
  description: string
  status: string
  date: string
  deadline?: string
  priority?: string
  schoolName?: string
  referenceId?: string
  originTable?: string
  protocol?: string
}

export interface AnalystAssignment {
  id: string
  analyst_id: string
  school_id: string
  permissions: {
    can_edit_documents: boolean
    can_view_sensitive: boolean
  }
  created_at?: string
  school?: {
    nome_escola: string
  }
  analyst?: {
    nome_usuario: string
  }
}

export interface AuditFinding {
  id: string
  audit_id: string
  description: string
  recommendation: string
  severity: 'Alta' | 'Média' | 'Baixa'
  status: 'Pendente' | 'Resolvido'
  created_at: string
}

export interface TriageFilters {
  schoolId?: string
  gravity?: string
  startDate?: Date
  endDate?: Date
}

export const complianceService = {
  async getAnalysts() {
    const { data, error } = await supabase
      .from('usuarios_escola')
      .select('*')
      .eq('perfil', 'ANALISTA_COMPLIANCE')
      .order('nome_usuario')
    if (error) throw error
    return data
  },

  async createAnalyst(data: {
    nome: string
    email: string
    password?: string
  }) {
    const { data: result, error } = await supabase.functions.invoke(
      'create-user',
      {
        body: {
          ...data,
          perfil: 'ANALISTA_COMPLIANCE',
          permissoes: { compliance: true },
          escola_id: null,
        },
      },
    )
    if (error) throw error
    if (result?.error) throw new Error(result.error)
    await auditService.logAction(
      'CREATE_ANALYST',
      `Novo Analista de Compliance criado: ${data.email}`,
      'usuarios_escola',
    )
    return result
  },

  async updateAnalyst(id: string, updates: any) {
    const { data, error } = await supabase
      .from('usuarios_escola')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async toggleAnalystStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('usuarios_escola')
      .update({ ativo: !currentStatus })
      .eq('id', id)
    if (error) throw error
  },

  async getSchools() {
    const { data, error } = await supabase
      .from('escolas_instituicoes')
      .select('id, nome_escola')
      .eq('ativo', true)
      .order('nome_escola')
    if (error) throw error
    return data
  },

  async getComplaintsForTriage(filters?: TriageFilters) {
    // For Director to see all complaints that need attention
    // Specifically Status "A designar"
    let query = supabase
      .from('denuncias')
      .select(
        'id, protocolo, categoria, status, gravidade, created_at, descricao, escola_id, escolas_instituicoes(nome_escola), autorizado_gestao, analista_id, anonimo, status_denuncia!inner(nome_status)',
      )
      .eq('status_denuncia.nome_status', 'A designar')
    // REMOVED: .is('analista_id', null) to strictly follow status based triage as requested

    if (filters) {
      if (filters.schoolId && filters.schoolId !== 'all') {
        query = query.eq('escola_id', filters.schoolId)
      }
      if (filters.gravity && filters.gravity !== 'all') {
        query = query.eq('gravidade', filters.gravity)
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString())
      }
      if (filters.endDate) {
        // Clone and add 1 day to end date to include the whole day
        const end = new Date(filters.endDate)
        end.setDate(end.getDate() + 1)
        query = query.lt('created_at', end.toISOString())
      }
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async assignAnalystToEntity(
    table:
      | 'denuncias'
      | 'investigacoes'
      | 'mediacoes'
      | 'processos_disciplinares'
      | 'due_diligence',
    recordId: string,
    analystId: string,
  ) {
    const { error } = await supabase
      .from(table)
      .update({ analista_id: analystId })
      .eq('id', recordId)

    if (error) throw error

    await auditService.logAction(
      'ASSIGN_ANALYST',
      `Analista ${analystId} atribuído ao registro ${recordId} na tabela ${table}`,
      table,
      { recordId, analystId },
    )
  },

  async assignInvestigation(
    complaintId: string,
    analystId: string,
    schoolId: string,
  ) {
    // Determine target status. Usually it goes to "Em análise de procedência"
    const targetStatusName = WORKFLOW_STATUS.ANALYSIS_1
    const targetStatusId = await workflowService.getStatusId(targetStatusName)

    const { error } = await supabase
      .from('denuncias')
      .update({
        analista_id: analystId, // Legacy field support
        analista_1_id: analystId, // Workflow Analyst 1
        status: targetStatusId,
      })
      .eq('id', complaintId)

    if (error) throw error

    // Log the transition
    await supabase.from('compliance_workflow_logs').insert({
      complaint_id: complaintId,
      new_status: targetStatusName,
      previous_status: 'A designar',
      comments: `Analista designado via Triagem: ${analystId}`,
    })

    await auditService.logAction(
      'ASSIGN_INVESTIGATION',
      `Analista ${analystId} designado para denúncia ${complaintId} (Triagem)`,
      'denuncias',
      { complaintId, analystId, schoolId, new_status: targetStatusName },
    )
  },

  async toggleSchoolAccess(complaintId: string, allowed: boolean) {
    const { error } = await supabase
      .from('denuncias')
      .update({ autorizado_gestao: allowed })
      .eq('id', complaintId)

    if (error) throw error

    await auditService.logAction(
      'TOGGLE_SCHOOL_ACCESS',
      `Acesso à denúncia ${complaintId} pela gestão escolar: ${allowed}`,
      'denuncias',
      { complaintId, allowed },
    )
  },

  async getAnalystAssignments(analystId?: string) {
    let query = supabase
      .from('analyst_assignments')
      .select(
        '*, school:school_id(nome_escola), analyst:analyst_id(nome_usuario)',
      )

    if (analystId) {
      query = query.eq('analyst_id', analystId)
    }

    const { data, error } = await query
    if (error) throw error
    return data as AnalystAssignment[]
  },

  async upsertAnalystAssignment(assignment: Partial<AnalystAssignment>) {
    const { data, error } = await supabase
      .from('analyst_assignments')
      .upsert(assignment)
      .select()
      .single()

    if (error) throw error
    await auditService.logAction(
      'UPSERT_ASSIGNMENT',
      `Permissões de analista atualizadas para escola ${assignment.school_id}`,
      'analyst_assignments',
      assignment,
    )
    return data
  },

  async deleteAnalystAssignment(id: string) {
    const { error } = await supabase
      .from('analyst_assignments')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getAssignedComplaints() {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), analyst:analista_id(id, nome_usuario, email)',
      )
      .not('analista_id', 'is', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAnalystComplaints(analystId: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia(nome_status)',
      )
      .or(
        `analista_id.eq.${analystId},analista_1_id.eq.${analystId},analista_2_id.eq.${analystId},analista_3_id.eq.${analystId}`,
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getComplaintsForSchool(schoolId: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        'id, protocolo, categoria, status, gravidade, created_at, descricao, autorizado_gestao, analista_id, anonimo',
      )
      .eq('escola_id', schoolId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getComplaintStatuses() {
    const { data, error } = await supabase
      .from('status_denuncia')
      .select('id, nome_status')
      .order('nome_status')
    if (error) throw error
    return data
  },

  async getTasks(filters?: { directorId?: string; analystId?: string }) {
    let query = supabase
      .from('compliance_tasks')
      .select(
        '*, analyst:analista_id(nome_usuario, email), secondary_analyst:secondary_analyst_id(nome_usuario, email), schools_instituicoes:escola_id(nome_escola), escolas_instituicoes(nome_escola)',
      )
      .order('created_at', { ascending: false })
    if (filters?.directorId) query = query.eq('diretor_id', filters.directorId)
    if (filters?.analystId)
      query = query.or(
        `analista_id.eq.${filters.analystId},secondary_analyst_id.eq.${filters.analystId}`,
      )
    const { data, error } = await query
    if (error) throw error
    return data as ComplianceTask[]
  },

  async getAnalystTasks(analystId: string) {
    const { data, error } = await supabase
      .from('compliance_tasks')
      .select(
        '*, escolas_instituicoes(nome_escola), analyst:analista_id(nome_usuario)',
      )
      .or(`analista_id.eq.${analystId},secondary_analyst_id.eq.${analystId}`)
      .neq('status', 'concluido')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAnalystInvestigations(analystId: string) {
    const { data, error } = await supabase
      .from('investigacoes')
      .select(
        '*, escolas_instituicoes(nome_escola), denuncias(protocolo, descricao)',
      )
      .eq('analista_id', analystId)
      .neq('status', 'concluido')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAnalystAudits(analystId: string) {
    const { data, error } = await supabase
      .from('auditorias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_auditoria(nome_status)',
      )
      .eq('analista_id', analystId)
      .order('data_auditoria', { ascending: false })

    if (error) throw error
    return data
  },

  async getAnalystDueDiligence(analystId: string) {
    const { data, error } = await supabase
      .from('due_diligence')
      .select(
        '*, escolas_instituicoes(nome_escola), status_due_diligence(nome_status)',
      )
      .eq('analista_id', analystId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAnalystRiskMatrix(analystId: string) {
    const { data, error } = await supabase
      .from('matriz_riscos')
      .select('*, escolas_instituicoes(nome_escola)')
      .eq('analista_id', analystId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getInvestigation(id: string) {
    const { data, error } = await supabase
      .from('investigacoes')
      .select(
        '*, escolas_instituicoes(nome_escola), denuncias(protocolo, descricao)',
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async updateInvestigation(id: string, updates: any) {
    const { data, error } = await supabase
      .from('investigacoes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTaskStatus(id: string, status: string) {
    const { error } = await supabase
      .from('compliance_tasks')
      .update({ status })
      .eq('id', id)

    if (error) throw error
  },

  async getTask(id: string) {
    const { data, error } = await supabase
      .from('compliance_tasks')
      .select('*, escolas_instituicoes(nome_escola)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as ComplianceTask
  },

  async uploadConsolidatedReport(schoolId: string, file: File, year: number) {
    // 1. Upload file
    const fileExt = file.name.split('.').pop()
    const fileName = `${schoolId}/${year}_consolidated_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documentos-institucionais')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('documentos-institucionais')
      .getPublicUrl(fileName)

    // 2. Insert DB record
    const { error: dbError } = await supabase
      .from('relatorios_consolidados')
      .upsert({
        escola_id: schoolId,
        ano: year,
        arquivo_url: publicUrl,
      })

    if (dbError) throw dbError
    return publicUrl
  },

  async getActiveComplaintsCount() {
    const { count, error } = await supabase
      .from('denuncias')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '("resolvido","arquivado","concluido")')

    if (error) {
      console.error('Error fetching active complaints count', error)
      return 0
    }
    return count || 0
  },

  async getUnassignedComplaintsCount() {
    const { count, error } = await supabase
      .from('denuncias')
      .select('*', { count: 'exact', head: true })
      .is('analista_id', null)

    if (error) {
      console.error('Error fetching unassigned complaints count', error)
      return 0
    }
    return count || 0
  },

  async getRecentAudits() {
    const { data, error } = await supabase
      .from('auditorias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_auditoria(nome_status)',
      )
      .order('data_auditoria', { ascending: false })
      .limit(10)

    if (error) throw error
    return data
  },

  async getAuditFindings(auditId: string) {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false })

    if (error) {
      // Gracefully handle if table doesn't exist yet (during migration overlap)
      console.warn('Could not fetch audit findings', error)
      return []
    }
    return data as AuditFinding[]
  },
}
