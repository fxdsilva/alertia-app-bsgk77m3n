import { supabase } from '@/lib/supabase/client'

export interface Partner {
  id: string
  nome: string
  tipo: 'parceiro' | 'patrocinador' | 'apoio'
  categoria: string | null
  logo_url: string | null
  link_url: string | null
  descricao: string | null
  ativo: boolean
}

export interface PartnerDocument {
  id: string
  titulo: string
  tipo: string
  data_documento: string | null
  arquivo_url: string
  ativo: boolean
}

export const partnersService = {
  async getPartners() {
    const { data, error } = await supabase
      .from('instituicoes_parceiras' as any)
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data as Partner[]
  },

  async getDocuments() {
    const { data, error } = await supabase
      .from('documentos_parceiros' as any)
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as PartnerDocument[]
  },

  async addPartner(partner: Omit<Partner, 'id' | 'ativo'>) {
    const { data, error } = await supabase
      .from('instituicoes_parceiras' as any)
      .insert([partner])
      .select()
      .single()
    if (error) throw error
    return data as Partner
  },

  async updatePartner(id: string, partner: Partial<Partner>) {
    const { data, error } = await supabase
      .from('instituicoes_parceiras' as any)
      .update(partner)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Partner
  },

  async deletePartner(id: string) {
    const { error } = await supabase
      .from('instituicoes_parceiras' as any)
      .update({ ativo: false })
      .eq('id', id)
    if (error) throw error
  },

  async uploadLogo(file: File): Promise<string> {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage
      .from('parceiros-logos')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage
      .from('parceiros-logos')
      .getPublicUrl(fileName)
    return data.publicUrl
  },
}
