import { supabase } from '@/lib/supabase/client'

export interface SchoolUser {
  id: string
  nome_usuario: string
  email: string
  perfil: string
  ativo: boolean
  escola_id: string
  escolas_instituicoes?: {
    nome_escola: string
  }
}

export const schoolAdminService = {
  async getUsers(schoolId: string) {
    const { data, error } = await supabase
      .from('usuarios_escola')
      .select('*, escolas_instituicoes(nome_escola)')
      .eq('escola_id', schoolId)
      .order('nome_usuario')

    if (error) throw error
    return data as SchoolUser[]
  },

  async createUser(data: {
    email: string
    password?: string
    nome: string
    perfil: string
    escola_id: string
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

  async updateUser(id: string, updates: Partial<SchoolUser>) {
    // Only update fields allowed by policy/logic
    const { data, error } = await supabase
      .from('usuarios_escola')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteUser(id: string) {
    // Use Edge Function to delete from Auth, cascade deletes from DB
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { user_id: id },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data
  },
}
