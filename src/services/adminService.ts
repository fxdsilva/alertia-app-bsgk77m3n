import { supabase } from '@/lib/supabase/client'
import { School } from '@/lib/mockData'

export interface Complaint {
  id: string
  protocolo: string
  status: string
  created_at: string
  descricao: string
  anonimo: boolean
  escola_id?: string
  escolas_instituicoes?: {
    nome_escola: string
  }
  status_denuncia?: {
    nome_status: string
  }
}

export const adminService = {
  async getSchoolId() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('usuarios_escola')
      .select('escola_id')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data.escola_id
  },

  // Document Management
  async getCodeOfConduct(schoolId: string) {
    const { data, error } = await supabase
      .from('codigo_conduta')
      .select('*')
      .eq('escola_id', schoolId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async upsertCodeOfConduct(schoolId: string, file: File, description: string) {
    // 1. Upload File
    const fileExt = file.name.split('.').pop()
    const fileName = `code-of-conduct-${schoolId}-${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('school-documents')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('school-documents').getPublicUrl(fileName)

    // 2. Upsert Record
    const existing = await this.getCodeOfConduct(schoolId)

    if (existing) {
      const { error } = await supabase
        .from('codigo_conduta')
        .update({ arquivo_url: publicUrl, descricao: description })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('codigo_conduta').insert({
        escola_id: schoolId,
        arquivo_url: publicUrl,
        descricao: description,
      })
      if (error) throw error
    }
  },

  async updateCodeOfConductDescription(id: string, description: string) {
    const { error } = await supabase
      .from('codigo_conduta')
      .update({ descricao: description })
      .eq('id', id)
    if (error) throw error
  },

  async deleteCodeOfConduct(id: string) {
    const { error } = await supabase
      .from('codigo_conduta')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Commitment Management
  async getCommitment(schoolId: string) {
    const { data, error } = await supabase
      .from('compromisso_alta_gestao')
      .select('*')
      .eq('escola_id', schoolId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async upsertCommitment(schoolId: string, file: File, description: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `commitment-${schoolId}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('school-documents')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('school-documents').getPublicUrl(fileName)

    const existing = await this.getCommitment(schoolId)

    if (existing) {
      const { error } = await supabase
        .from('compromisso_alta_gestao')
        .update({ arquivo_url: publicUrl, descricao: description })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('compromisso_alta_gestao').insert({
        escola_id: schoolId,
        arquivo_url: publicUrl,
        descricao: description,
      })
      if (error) throw error
    }
  },

  async updateCommitmentDescription(id: string, description: string) {
    const { error } = await supabase
      .from('compromisso_alta_gestao')
      .update({ descricao: description })
      .eq('id', id)
    if (error) throw error
  },

  async deleteCommitment(id: string) {
    const { error } = await supabase
      .from('compromisso_alta_gestao')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Complaint Management
  async getComplaints(schoolId: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia(nome_status)',
      )
      .eq('escola_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as Complaint[]
  },

  async getComplaint(id: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia(nome_status)',
      )
      .eq('id', id)
      .single()
    if (error) throw error
    return data as unknown as Complaint
  },

  async getAllPendingComplaints() {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        '*, escolas_instituicoes(nome_escola), status_denuncia!inner(nome_status)',
      )
      .eq('status_denuncia.nome_status', 'Denúncia registrada')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as Complaint[]
  },

  async updateComplaintStatus(id: string, status: string) {
    const { error } = await supabase
      .from('denuncias')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  },

  async deleteComplaint(id: string) {
    const { error } = await supabase.from('denuncias').delete().eq('id', id)
    if (error) throw error
  },

  async createInternalComplaint(
    schoolId: string,
    description: string,
    anonimo: boolean,
  ) {
    const protocol =
      new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      '-' +
      Math.floor(100000 + Math.random() * 900000)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Assuming we might need to look up status ID for 'pendente' or similar in future
    // For now keeping 'pendente' string to match potential legacy behavior or if status handles strings in insert via trigger/view
    // But ideally should fetch status ID.
    const { error } = await supabase.from('denuncias').insert({
      escola_id: schoolId,
      descricao: description,
      anonimo: anonimo,
      protocolo: protocol,
      denunciante_id: anonimo ? null : user?.id,
      status: 'pendente',
    })
    if (error) throw error
  },

  async getComplaintStats(schoolId: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select('status')
      .eq('escola_id', schoolId)

    if (error) throw error

    const total = data.length
    const byStatus = data.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1
      return acc
    }, {})

    return { total, byStatus }
  },

  // Admin Master: School Management
  async getAllSchools(): Promise<School[]> {
    const { data, error } = await supabase
      .from('escolas_instituicoes')
      .select('*')
      .order('nome_escola')

    if (error) throw error

    return data.map((item: any) => ({
      id: item.id,
      name: item.nome_escola,
      network: item.rede_municipal
        ? 'Municipal'
        : item.rede_estadual
          ? 'Estadual'
          : item.rede_federal
            ? 'Federal'
            : 'Privada',
      modality: item.localizacao as 'Urbana' | 'Rural',
      municipality: item.endereco || 'N/A',
      state: 'N/A',
      active: item.ativo,
    }))
  },

  async toggleSchoolStatus(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('escolas_instituicoes')
      .update({ ativo: isActive } as any)
      .eq('id', id)

    if (error) throw error
  },
}
