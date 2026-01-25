import { supabase } from '@/lib/supabase/client'
import { auditService } from './auditService'

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

export const complianceService = {
  async ensureStatusId(statusInput: string): Promise<string> {
    if (!statusInput) throw new Error('Status input cannot be empty')
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (uuidRegex.test(statusInput)) {
      const { data } = await supabase
        .from('status_denuncia')
        .select('id')
        .eq('id', statusInput)
        .maybeSingle()
      if (data) return data.id
      throw new Error(`Status ID inválido ou não encontrado: ${statusInput}`)
    }

    const { data } = await supabase
      .from('status_denuncia')
      .select('id')
      .ilike('nome_status', statusInput)
      .maybeSingle()
    if (data) return data.id

    const { data: newStatus, error } = await supabase
      .from('status_denuncia')
      .insert({ nome_status: statusInput })
      .select('id')
      .single()
    if (error) throw new Error('Falha ao criar novo status.')
    return newStatus.id
  },

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

  async getSchoolsWithPendingComplaints() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return [] // Auth guard

    const { data: complaints, error } = await supabase
      .from('denuncias')
      .select('escola_id, status_denuncia!inner(nome_status)')
      .in('status_denuncia.nome_status', [
        'Pendente',
        'Em Análise',
        'Investigação',
      ])

    if (error) throw new Error('Erro ao carregar denúncias.')

    const schoolIds = [
      ...new Set(
        complaints?.map((c) => c.escola_id).filter((id) => id !== null) || [],
      ),
    ]
    if (schoolIds.length === 0) return []

    const { data: schools, error: schoolsError } = await supabase
      .from('escolas_instituicoes')
      .select('id, nome_escola')
      .in('id', schoolIds)
      .order('nome_escola')

    if (schoolsError) throw new Error('Erro ao carregar lista de escolas.')
    return schools
  },

  async getSchoolsWithUnassignedComplaints() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return [] // Auth guard

    const { data: complaints, error } = await supabase
      .from('denuncias')
      .select('escola_id')
      .is('analista_id', null)

    if (error) throw error

    const schoolIds = [
      ...new Set(
        complaints?.map((c) => c.escola_id).filter((id) => id !== null) || [],
      ),
    ]
    if (schoolIds.length === 0) return []

    const { data: schools, error: schoolsError } = await supabase
      .from('escolas_instituicoes')
      .select('id, nome_escola')
      .in('id', schoolIds)
      .order('nome_escola')

    if (schoolsError) throw error
    return schools
  },

  async getUnassignedComplaints(schoolId?: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return [] // Auth guard

    let query = supabase
      .from('denuncias')
      .select(
        'id, protocolo, categoria, status, gravidade, created_at, descricao, escola_id, escolas_instituicoes(nome_escola), autorizado_gestao',
      )
      .is('analista_id', null)
      .order('created_at', { ascending: false })

    if (schoolId) {
      query = query.eq('escola_id', schoolId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getComplaintsForTriage() {
    // For Director to see all complaints that need attention
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        'id, protocolo, categoria, status, gravidade, created_at, descricao, escola_id, escolas_instituicoes(nome_escola), autorizado_gestao, analista_id',
      )
      .or('analista_id.is.null,status.eq.pendente')
      .order('created_at', { ascending: false })

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
    // Assign analyst and update status to indicate investigation started
    const { error } = await supabase
      .from('denuncias')
      .update({
        analista_id: analystId,
        status: 'em_analise', // Or 'investigacao' based on status table
      })
      .eq('id', complaintId)

    if (error) throw error

    await auditService.logAction(
      'ASSIGN_INVESTIGATION',
      `Analista ${analystId} designado para denúncia ${complaintId}`,
      'denuncias',
      { complaintId, analystId, schoolId },
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

  async getComplaintFullDetail(id: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) throw new Error('Unauthorized')

    const { data: complaint, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia(id, nome_status)',
      )
      .eq('id', id)
      .single()
    if (error) throw error
    return complaint
  },

  async createTask(
    data: Omit<
      ComplianceTask,
      'id' | 'created_at' | 'analyst' | 'secondary_analyst'
    >,
  ) {
    const { data: result, error } = await supabase
      .from('compliance_tasks')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    await auditService.logAction(
      'ASSIGN_TASK',
      `Tarefa atribuída ao analista ${data.analista_id}`,
      'compliance_tasks',
      { tipo: data.tipo_modulo, escola: data.escola_id },
    )
    return result
  },

  async getTasks(filters?: { directorId?: string; analystId?: string }) {
    let query = supabase
      .from('compliance_tasks')
      .select(
        '*, analyst:analista_id(nome_usuario, email), secondary_analyst:secondary_analyst_id(nome_usuario, email), school:escola_id(nome_escola)',
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

  async getSchoolManagers(schoolId: string) {
    const { data, error } = await supabase
      .from('usuarios_escola')
      .select('*')
      .eq('escola_id', schoolId)
      .in('perfil', ['gestor', 'diretor', 'admin_escolar'])
    if (error) throw error
    return data
  },

  async hasSchoolDocPermission(
    userId: string,
    schoolId: string,
  ): Promise<boolean> {
    // Check if there is an active task granting permission
    const { data } = await supabase
      .from('compliance_tasks')
      .select('id')
      .eq('analista_id', userId)
      .eq('escola_id', schoolId)
      .eq('institutional_docs_auth', true)
      .neq('status', 'concluido')
      .limit(1)

    return !!data && data.length > 0
  },
}
