import { supabase } from '@/lib/supabase/client'
import { School } from '@/lib/mockData'

export interface DocumentRecord {
  id: string
  escola_id: string
  arquivo_url: string
  descricao: string | null
  created_at: string
}

export const portalService = {
  async searchSchools(query: string): Promise<School[]> {
    if (!query.trim()) return []

    const { data, error } = await supabase
      .from('escolas_instituicoes')
      .select(
        'id, nome_escola, rede_municipal, rede_estadual, rede_federal, localizacao, endereco, ativo',
      )
      .eq('ativo', true)
      .ilike('nome_escola', `%${query}%`)
      .limit(10)

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

  async getSchools(): Promise<School[]> {
    // Selecting specific columns as per requirements, but ensuring we have enough for the interface
    const { data, error } = await supabase
      .from('escolas_instituicoes')
      .select('id, nome_escola, ativo')
      .eq('ativo', true)
      .order('nome_escola')

    if (error) throw error

    return data.map((item: any) => ({
      id: item.id,
      name: item.nome_escola,
      // Default values for fields not fetched in this specific query
      network: 'Municipal',
      modality: 'Urbana',
      municipality: 'N/A',
      state: 'N/A',
      active: item.ativo,
    }))
  },

  async getManagementCommitment(escolaId: string) {
    const { data, error } = await supabase
      .from('compromisso_alta_gestao')
      .select('*')
      .eq('escola_id', escolaId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as DocumentRecord | null
  },

  async getCodeOfConduct(escolaId: string) {
    const { data, error } = await supabase
      .from('codigo_conduta')
      .select('*')
      .eq('escola_id', escolaId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as DocumentRecord | null
  },

  async createComplaint(data: {
    escola_id: string
    descricao: string
    anonimo: boolean
    denunciante_id?: string
    categoria?: string[]
  }) {
    const protocol = generateProtocol()

    // Enforce logic: if anonymous is true, denunciante_id must be null
    const finalAnonimo = data.anonimo
    const finalDenuncianteId = data.anonimo ? null : data.denunciante_id

    const { data: result, error } = await supabase
      .from('denuncias')
      .insert({
        escola_id: data.escola_id,
        protocolo: protocol,
        descricao: data.descricao,
        anonimo: finalAnonimo,
        denunciante_id: finalDenuncianteId,
        categoria: data.categoria,
        status: 'pendente',
      })
      .select()
      .single()

    if (error) throw error
    return result
  },

  async getComplaintStatus(protocol: string) {
    const { data, error } = await supabase.rpc('get_complaint_by_protocol', {
      protocol_query: protocol,
    })

    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },
}

function generateProtocol() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(100000 + Math.random() * 900000)
  return `${date}-${random}`
}
