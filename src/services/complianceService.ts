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
        'id, protocolo, categoria, status, gravidade, created_at, descricao, escola_id, escolas_instituicoes(nome_escola)',
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
      .select('id, protocolo, categoria, status, gravidade, created_at')
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

  async assignComplaintTask(
    taskData: Omit<
      ComplianceTask,
      'id' | 'created_at' | 'analyst' | 'secondary_analyst'
    >,
  ) {
    // 1. Create the Compliance Task
    const task = await this.createTask(taskData)

    // 2. Update the Complaint with the Analyst ID to mark it as assigned
    if (taskData.referencia_id) {
      const { error } = await supabase
        .from('denuncias')
        .update({ analista_id: taskData.analista_id })
        .eq('id', taskData.referencia_id)

      if (error) {
        console.error('Failed to link analyst to complaint record', error)
        // We do not revert the task creation, but log the error
        await auditService.logAction(
          'ERROR',
          `Falha ao vincular analista à denúncia ${taskData.referencia_id}`,
          'denuncias',
        )
      }
    }
    return task
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

  async getUnifiedTasks(analystId: string): Promise<UnifiedTask[]> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return []

    const { data: complianceTasks } = await supabase
      .from('compliance_tasks')
      .select('*, school:escola_id(nome_escola)')
      .or(`analista_id.eq.${analystId},secondary_analyst_id.eq.${analystId}`)
      .order('created_at', { ascending: false })

    const { data: complaints } = await supabase
      .from('denuncias')
      .select(
        'id, protocolo, descricao, status, created_at, escola_id(nome_escola)',
      )
      .eq('analista_id', analystId)
      .neq('status', 'concluido')

    const { data: audits } = await supabase
      .from('auditorias')
      .select('id, tipo, status, created_at, escola_id(nome_escola)')
      .eq('analista_id', analystId)
      .neq('status', 'concluida')

    const { data: mediations } = await supabase
      .from('mediacoes')
      .select('id, caso, status, created_at, escola_id(nome_escola)')
      .eq('analista_id', analystId)
      .neq('status', 'concluido')

    const tasks: UnifiedTask[] = []
    complianceTasks?.forEach((t) => {
      tasks.push({
        id: t.id,
        type: 'compliance_task',
        module: t.tipo_modulo,
        description: t.descricao || 'Tarefa sem descrição',
        status: t.status,
        date: t.created_at,
        deadline: t.prazo || undefined,
        schoolName: t.school?.nome_escola,
        referenceId: t.referencia_id || undefined,
        protocol: t.referencia_id ? undefined : undefined,
      })
    })
    complaints?.forEach((c) => {
      tasks.push({
        id: c.id,
        type: 'direct_assignment',
        module: 'Denúncia',
        description: `Protocolo ${c.protocolo}`,
        status: c.status,
        date: c.created_at,
        schoolName: (c.escola_id as any)?.nome_escola,
        referenceId: c.id,
        protocol: c.protocolo,
      })
    })
    audits?.forEach((a) => {
      tasks.push({
        id: a.id,
        type: 'direct_assignment',
        module: 'Auditoria',
        description: `Auditoria: ${a.tipo}`,
        status: a.status,
        date: a.created_at,
        schoolName: (a.escola_id as any)?.nome_escola,
        referenceId: a.id,
      })
    })
    mediations?.forEach((m) => {
      tasks.push({
        id: m.id,
        type: 'direct_assignment',
        module: 'Mediação',
        description: `Caso: ${m.caso}`,
        status: m.status,
        date: m.created_at,
        schoolName: (m.escola_id as any)?.nome_escola,
        referenceId: m.id,
      })
    })
    return tasks.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  },

  async getTaskById(taskId: string) {
    const { data, error } = await supabase
      .from('compliance_tasks')
      .select(
        '*, analyst:analista_id(nome_usuario, email), secondary_analyst:secondary_analyst_id(nome_usuario, email), school:escola_id(nome_escola)',
      )
      .eq('id', taskId)
      .single()
    if (error) throw error
    return data as ComplianceTask
  },

  async updateTaskStatus(taskId: string, status: string, notes?: string) {
    const updates: any = { status }
    if (status === 'completed')
      updates.data_conclusao = new Date().toISOString()
    if (notes) updates.correction_notes = notes
    const { error } = await supabase
      .from('compliance_tasks')
      .update(updates)
      .eq('id', taskId)
    if (error) throw error
  },

  async updateTaskResponse(
    taskId: string,
    response: string,
    proposedStatus?: string,
  ) {
    const updates: any = { response_text: response }
    if (proposedStatus !== undefined) {
      if (proposedStatus && proposedStatus.trim() !== '') {
        try {
          const validId = await this.ensureStatusId(proposedStatus)
          updates.proposed_complaint_status = validId
        } catch (e) {
          throw new Error('Status proposto inválido.')
        }
      } else {
        updates.proposed_complaint_status = null
      }
    }
    const { error } = await supabase
      .from('compliance_tasks')
      .update(updates)
      .eq('id', taskId)
    if (error) throw error
  },

  async processStatusProposal(taskId: string, approved: boolean) {
    const { error } = await supabase.rpc('approve_task_proposal', {
      p_task_id: taskId,
      p_approve: approved,
    })
    if (error) throw error
    await auditService.logAction(
      approved ? 'APPROVE_STATUS_PROPOSAL' : 'REJECT_STATUS_PROPOSAL',
      approved
        ? 'Aprovação de mudança de status via proposta'
        : 'Rejeição de proposta de status',
      'compliance_tasks',
      { taskId, approved },
    )
  },

  async approveTaskValidation(
    taskId: string,
    approved: boolean,
    feedback?: string,
  ) {
    if (approved) {
      const { data: task } = await supabase
        .from('compliance_tasks')
        .select('proposed_complaint_status')
        .eq('id', taskId)
        .single()
      if (task?.proposed_complaint_status)
        await this.processStatusProposal(taskId, true)
      const { error } = await supabase
        .from('compliance_tasks')
        .update({
          status: 'completed',
          data_conclusao: new Date().toISOString(),
        })
        .eq('id', taskId)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('compliance_tasks')
        .update({ status: 'in_progress', correction_notes: feedback })
        .eq('id', taskId)
      if (error) throw error
    }
  },

  async getTaskEvidences(taskId: string) {
    const { data, error } = await supabase
      .from('compliance_task_evidences')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as TaskEvidence[]
  },

  async addEvidence(
    taskId: string,
    url: string,
    description: string,
    userId: string,
  ) {
    const { data, error } = await supabase
      .from('compliance_task_evidences')
      .insert({ task_id: taskId, url, description, uploaded_by: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteEvidence(evidenceId: string) {
    const { error } = await supabase
      .from('compliance_task_evidences')
      .delete()
      .eq('id', evidenceId)
    if (error) throw error
  },

  async getInternalControls(analystId?: string) {
    let query = supabase.from('controles_internos').select('*')
    if (analystId) query = query.eq('analista_id', analystId)
    const { data, error } = await query
    if (error) throw error
    return data as InternalControl[]
  },

  async getDirectorStats() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null // Guard against unauthorized access on public/login pages

    const { data: analysts } = await supabase
      .from('usuarios_escola')
      .select('id, ativo, nome_usuario')
      .eq('perfil', 'ANALISTA_COMPLIANCE')
    const { data: tasks } = await supabase
      .from('compliance_tasks')
      .select(
        '*, analyst:analista_id(nome_usuario), secondary_analyst:secondary_analyst_id(nome_usuario), school:escola_id(nome_escola)',
      )
    const { data: audits } = await supabase
      .from('auditorias')
      .select(
        '*, analyst:analista_id(nome_usuario), school:escola_id(nome_escola)',
      )
      .order('created_at', { ascending: false })
    const { data: trainingCompletions } = await supabase
      .from('treinamentos_conclusoes')
      .select(
        '*, training:treinamento_id(titulo, escola_id(nome_escola)), user:usuario_id(nome_usuario, perfil)',
      )
      .order('data_conclusao', { ascending: false })
      .limit(100)
    const { data: complaints } = await supabase
      .from('denuncias')
      .select('id, created_at, updated_at, status, escola_id(nome_escola)')
      .eq('status', 'Concluída')
    const { data: complaintStatuses } = await supabase
      .from('status_denuncia')
      .select('id, nome_status')

    // Triage Stats - Safely query count using limit(0) instead of HEAD to avoid empty body parsing issues in some clients
    const { count: unassignedCount } = await supabase
      .from('denuncias')
      .select('*', { count: 'exact', head: false })
      .is('analista_id', null)
      .limit(0)

    const complaintTaskIds =
      tasks
        ?.filter(
          (t) =>
            (t.tipo_modulo === 'Denúncia' || t.tipo_modulo === 'Denuncia') &&
            t.referencia_id,
        )
        .map((t) => t.referencia_id as string) || []
    let complaintProtocols: Record<string, string> = {}
    if (complaintTaskIds.length > 0) {
      const { data: protocols } = await supabase
        .from('denuncias')
        .select('id, protocolo')
        .in('id', complaintTaskIds)
      protocols?.forEach((p) => {
        complaintProtocols[p.id] = p.protocolo
      })
    }
    const enrichedTasks = tasks?.map((t) => ({
      ...t,
      protocol:
        (t.tipo_modulo === 'Denúncia' || t.tipo_modulo === 'Denuncia') &&
        t.referencia_id
          ? complaintProtocols[t.referencia_id]
          : undefined,
    }))
    const activeTasks =
      tasks?.filter((t) => t.status === 'pending' || t.status === 'in_progress')
        .length || 0
    const pendingValidation =
      tasks?.filter(
        (t) =>
          t.status === 'validation' ||
          (t.proposed_complaint_status !== null &&
            t.status !== 'completed' &&
            t.status !== 'rejeitado'),
      ).length || 0
    const highRiskTasks =
      tasks?.filter(
        (t) => t.nivel_risco === 'Alto' || t.nivel_risco === 'Critico',
      ).length || 0
    const institutionalRisk = Math.min(100, highRiskTasks * 5 + activeTasks * 1)

    const pillarsMap: Record<string, number> = {}
    tasks?.forEach((t) => {
      const p = t.pillar || 'Geral'
      pillarsMap[p] = (pillarsMap[p] || 0) + 1
    })
    const pillarsData = Object.keys(pillarsMap).map((k) => ({
      name: k,
      value: pillarsMap[k],
    }))

    let totalTime = 0
    let completedCount = 0
    tasks?.forEach((t) => {
      if (t.data_conclusao && t.created_at) {
        const diff =
          new Date(t.data_conclusao).getTime() -
          new Date(t.created_at).getTime()
        totalTime += diff
        completedCount++
      }
    })
    const avgResolutionTimeDays =
      completedCount > 0
        ? totalTime / completedCount / (1000 * 60 * 60 * 24)
        : 0

    return {
      analystCount: analysts?.length || 0,
      activeAnalysts: analysts?.filter((a) => a.ativo).length || 0,
      inactiveAnalysts:
        (analysts?.length || 0) -
        (analysts?.filter((a) => a.ativo).length || 0),
      activeTasks,
      pendingValidation,
      institutionalRisk,
      avgResolutionTimeDays: Math.round(avgResolutionTimeDays),
      pillarsData,
      tasks: enrichedTasks || [],
      analystsList: analysts || [],
      complaintStatuses: complaintStatuses || [],
      audits: audits || [],
      trainingCompletions: trainingCompletions || [],
      benchmarkingComplaints: complaints || [],
      unassignedCount: unassignedCount || 0,
    }
  },

  async forwardToInvestigation(complaintId: string, userId: string) {
    const { data: complaint } = await supabase
      .from('denuncias')
      .select('escola_id')
      .eq('id', complaintId)
      .single()
    if (!complaint) throw new Error('Denúncia não encontrada')
    const { error } = await supabase.from('investigacoes').insert({
      denuncia_id: complaintId,
      escola_id: complaint.escola_id,
      status: 'em_andamento',
      analista_id: userId,
      data_inicio: new Date().toISOString(),
    })
    if (error) throw error
    await this.updateComplaintStatus(complaintId, 'investigacao')
  },

  async forwardToMediation(complaintId: string, userId: string) {
    const { data: complaint } = await supabase
      .from('denuncias')
      .select('escola_id')
      .eq('id', complaintId)
      .single()
    if (!complaint) throw new Error('Denúncia não encontrada')
    const { error } = await supabase.from('mediacoes').insert({
      escola_id: complaint.escola_id,
      analista_id: userId,
      status: 'aberto',
      caso: `Originado da denúncia (Protocolo pendente)`,
      partes_envolvidas: 'Verificar denúncia',
      data_inicio: new Date().toISOString(),
    })
    if (error) throw error
    await this.updateComplaintStatus(complaintId, 'mediacao')
  },

  async forwardToDisciplinary(complaintId: string, userId: string) {
    const { data: complaint } = await supabase
      .from('denuncias')
      .select('escola_id')
      .eq('id', complaintId)
      .single()
    if (!complaint) throw new Error('Denúncia não encontrada')
    const { error } = await supabase.from('processos_disciplinares').insert({
      escola_id: complaint.escola_id,
      analista_id: userId,
      status: 'aberto',
      titulo: 'Processo Disciplinar via Compliance',
      data_abertura: new Date().toISOString(),
    })
    if (error) throw error
    await this.updateComplaintStatus(complaintId, 'disciplinar')
  },

  async updateComplaintStatus(id: string, status: string) {
    const { error } = await supabase
      .from('denuncias')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  },

  async getMyComplaints(userId: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select('*, escolas_instituicoes(nome_escola)')
      .eq('analista_id', userId)
      .neq('status', 'concluido')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getMyAudits(userId: string) {
    const { data, error } = await supabase
      .from('auditorias')
      .select('*, escolas_instituicoes(nome_escola)')
      .eq('analista_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getMyDueDiligence(userId: string) {
    const { data, error } = await supabase
      .from('due_diligence')
      .select('*, escolas_instituicoes(nome_escola)')
      .eq('analista_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getMyRisks(userId: string) {
    const { data, error } = await supabase
      .from('matriz_riscos')
      .select('*')
      .eq('analista_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getMyMediations(userId: string) {
    const { data, error } = await supabase
      .from('mediacoes')
      .select('*, escolas_instituicoes(nome_escola)')
      .eq('analista_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getMyDisciplinary(userId: string) {
    const { data, error } = await supabase
      .from('processos_disciplinares')
      .select('*, escolas_instituicoes(nome_escola)')
      .eq('analista_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getCommitmentDocs() {
    const { data, error } = await supabase
      .from('compromisso_alta_gestao')
      .select('*, escolas_instituicoes(nome_escola)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getCodeOfConductDocs() {
    const { data, error } = await supabase
      .from('codigo_conduta')
      .select('*, escolas_instituicoes(nome_escola)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getTrainings() {
    const { data, error } = await supabase
      .from('treinamentos')
      .select('*, escolas_instituicoes(nome_escola)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async createInternalControl(data: any) {
    const { error } = await supabase.from('controles_internos').insert(data)
    if (error) throw error
  },

  async updateInternalControl(id: string, updates: any) {
    const { error } = await supabase
      .from('controles_internos')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  async createTrainingFromTask(data: any, taskId: string, userId?: string) {
    const { data: training, error } = await supabase
      .from('treinamentos')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    await supabase
      .from('compliance_tasks')
      .update({
        status: 'completed',
        data_conclusao: new Date().toISOString(),
        response_text: `Treinamento "${training.titulo}" criado com sucesso.`,
      })
      .eq('id', taskId)
    await auditService.logAction(
      'CREATE_TRAINING_FROM_TASK',
      `Treinamento criado a partir de tarefa de compliance`,
      'treinamentos',
      { taskId, trainingId: training.id },
    )
  },
}
