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
  institutional_docs_auth: boolean
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

export const complianceService = {
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
        status: 'pendente', // Default status
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}
