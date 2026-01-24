import { supabase } from '@/lib/supabase/client'
import { SchoolUser } from './schoolAdminService'

export interface ComplianceTask {
  id: string
  titulo?: string
  descricao: string | null
  tipo_modulo: string
  escola_id: string | null
  analista_id: string
  diretor_id: string
  status: string
  prazo: string | null
  institutional_docs_auth:
    | boolean
    | {
        include?: boolean
        elaborate?: boolean
        update?: boolean
        consolidate?: boolean
      }
    | null
  school_manager_access_config: {
    view_content: boolean
    view_evidence: boolean
    track_status: boolean
  } | null
  gestor_escolar_id: string | null
  created_at: string
  escolas_instituicoes?: {
    nome_escola: string
  }
  analista?: {
    nome_usuario: string
  }
  gestor?: {
    nome_usuario: string
  }
}

export interface Investigation {
  id: string
  denuncia_id: string
  analista_id: string
  escola_id: string
  status: string
  data_inicio: string
  data_conclusao: string | null
  resultado: string | null
  evidencias_urls: string[] | null
  denuncias?: {
    protocolo: string
    descricao: string
    gravidade: string
    categoria: string[]
  }
  escolas_instituicoes?: {
    nome_escola: string
  }
  analista?: {
    nome_usuario: string
  }
}

export const complianceService = {
  // TASKS
  async getTasks() {
    const { data, error } = await supabase
      .from('compliance_tasks')
      .select(
        `
        *,
        escolas_instituicoes(nome_escola),
        analista:usuarios_escola!analista_id(nome_usuario),
        gestor:usuarios_escola!gestor_escolar_id(nome_usuario)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as ComplianceTask[]
  },

  async getAnalystTasks(analystId: string) {
    const { data, error } = await supabase
      .from('compliance_tasks')
      .select(
        `
        *,
        escolas_instituicoes(nome_escola),
        gestor:usuarios_escola!gestor_escolar_id(nome_usuario)
      `,
      )
      .eq('analista_id', analystId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as ComplianceTask[]
  },

  async getTask(id: string) {
    const { data, error } = await supabase
      .from('compliance_tasks')
      .select(
        `
        *,
        escolas_instituicoes(nome_escola),
        analista:usuarios_escola!analista_id(nome_usuario)
      `,
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data as ComplianceTask
  },

  async createTask(task: Partial<ComplianceTask>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('compliance_tasks')
      .insert({
        ...task,
        diretor_id: user.id,
        status: 'pendente',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTaskStatus(taskId: string, status: string) {
    const { error } = await supabase
      .from('compliance_tasks')
      .update({ status })
      .eq('id', taskId)

    if (error) throw error
  },

  async hasSchoolDocPermission(userId: string, schoolId: string) {
    // Check if user has admin/director profile first
    const { data: userProfile } = await supabase
      .from('usuarios_escola')
      .select('perfil')
      .eq('id', userId)
      .single()

    if (
      userProfile &&
      ['diretor', 'gestao_escola', 'admin', 'admin_master'].includes(
        userProfile.perfil,
      )
    ) {
      return true
    }

    // Check for active tasks with permission
    const { data } = await supabase
      .from('compliance_tasks')
      .select('institutional_docs_auth')
      .eq('analista_id', userId)
      .eq('escola_id', schoolId)
      .neq('status', 'concluido')

    if (!data) return false

    // Check if any task has the 'update' permission in the JSON
    return data.some((task: any) => {
      const auth = task.institutional_docs_auth
      if (typeof auth === 'boolean') return auth
      return auth?.update === true
    })
  },

  // COMPLAINTS TRIAGE
  async getComplaintsForTriage() {
    const { data, error } = await supabase
      .from('denuncias')
      .select('*, escolas_instituicoes(nome_escola)')
      .in('status', ['pendente', 'em_analise'])
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // INVESTIGATIONS
  async assignInvestigation(
    denunciaId: string,
    analystId: string,
    schoolId: string,
  ) {
    // 1. Create investigation record
    const { data: inv, error: invError } = await supabase
      .from('investigacoes')
      .insert({
        denuncia_id: denunciaId,
        analista_id: analystId,
        escola_id: schoolId,
        status: 'em_andamento',
        data_inicio: new Date().toISOString(),
      })
      .select()
      .single()

    if (invError) throw invError

    // 2. Update complaint status
    const { error: updError } = await supabase
      .from('denuncias')
      .update({ status: 'em_investigacao', analista_id: analystId })
      .eq('id', denunciaId)

    if (updError) throw updError

    return inv
  },

  async getAnalystInvestigations(analystId: string) {
    const { data, error } = await supabase
      .from('investigacoes')
      .select(
        `
        *,
        denuncias (*),
        escolas_instituicoes (nome_escola)
      `,
      )
      .eq('analista_id', analystId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Investigation[]
  },

  async getInvestigation(id: string) {
    const { data, error } = await supabase
      .from('investigacoes')
      .select(
        `
        *,
        denuncias (*),
        escolas_instituicoes (nome_escola),
        analista:usuarios_escola!analista_id (nome_usuario)
      `,
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Investigation
  },

  async updateInvestigation(id: string, updates: any) {
    const { error } = await supabase
      .from('investigacoes')
      .update(updates)
      .eq('id', id)

    if (error) throw error
  },

  // RESOURCES
  async getAnalysts() {
    const { data, error } = await supabase
      .from('usuarios_escola')
      .select('*')
      .eq('perfil', 'ANALISTA_COMPLIANCE')
      .eq('ativo', true)
      .order('nome_usuario')

    if (error) throw error
    return data as SchoolUser[]
  },

  async getSchoolManagers(schoolId: string) {
    const { data, error } = await supabase
      .from('usuarios_escola')
      .select('*')
      .eq('escola_id', schoolId)
      .in('perfil', ['gestao_escola', 'diretor', 'gestor'])
      .eq('ativo', true)
      .order('nome_usuario')

    if (error) throw error
    return data as SchoolUser[]
  },

  // CONSOLIDATED REPORTS
  async uploadConsolidatedReport(schoolId: string, file: File, year: number) {
    const fileExt = file.name.split('.').pop()
    const fileName = `consolidated-${schoolId}-${year}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('school-documents')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('school-documents').getPublicUrl(fileName)

    const { error } = await supabase.from('relatorios_consolidados').insert({
      escola_id: schoolId,
      arquivo_url: publicUrl,
      ano: year,
    })

    if (error) throw error
    return publicUrl
  },
}
