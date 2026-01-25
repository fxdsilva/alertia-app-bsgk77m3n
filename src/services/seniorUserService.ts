import { supabase } from '@/lib/supabase/client'

export interface SeniorUser {
  id: string
  nome_usuario: string
  email: string
  perfil: string
  ativo: boolean
  escola_id: string | null
  cargo: string | null
  departamento: string | null
  escolas_instituicoes?: {
    nome_escola: string
  } | null
}

export interface SchoolOption {
  id: string
  nome_escola: string
}

export const seniorUserService = {
  async getAllUsers() {
    const { data, error } = await supabase
      .from('usuarios_escola')
      .select('*, escolas_instituicoes(nome_escola)')
      .order('nome_usuario')

    if (error) throw error
    return data as SeniorUser[]
  },

  async getAllSchools() {
    const { data, error } = await supabase
      .from('escolas_instituicoes')
      .select('id, nome_escola')
      .eq('ativo', true)
      .order('nome_escola')

    if (error) throw error
    return data as SchoolOption[]
  },

  async createUser(data: {
    email: string
    password?: string
    nome: string
    perfil: string
    escola_id: string
    cargo?: string
    departamento?: string
    ativo?: boolean
  }) {
    const { data: result, error } = await supabase.functions.invoke(
      'create-user',
      {
        body: data,
      },
    )

    if (error) throw error
    if (result?.error) throw new Error(result.error)
    return result
  },

  async updateUser(id: string, data: Partial<SeniorUser>) {
    const { data: result, error } = await supabase
      .from('usuarios_escola')
      .update({
        nome_usuario: data.nome_usuario,
        email: data.email,
        perfil: data.perfil,
        escola_id: data.escola_id,
        ativo: data.ativo,
        cargo: data.cargo,
        departamento: data.departamento,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  },

  async deleteUser(id: string) {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { user_id: id },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data
  },

  async toggleUserStatus(id: string, status: boolean) {
    const { data, error } = await supabase
      .from('usuarios_escola')
      .update({ ativo: status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
