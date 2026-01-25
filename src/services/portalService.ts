import { supabase } from '@/lib/supabase/client'
import { School } from '@/lib/mockData'
import { WORKFLOW_STATUS } from './workflowService'

export interface DocumentRecord {
  id: string
  escola_id: string
  arquivo_url: string
  descricao: string | null
  created_at: string
}

export interface ComplaintData {
  escola_id: string
  descricao: string
  anonimo: boolean
  denunciante_id?: string | null
  categoria?: string[]
  envolvidos_detalhes?: Record<string, any>
  evidencias_urls?: string[]
}

export const portalService = {
  async searchSchools(query: string): Promise<School[]> {
    if (!query.trim()) return []

    const { data, error } = await supabase
      .from('escolas_instituicoes')
      .select(
        'id, nome_escola, rede_municipal, rede_estadual, rede_federal, rede_particular, localizacao, endereco, ativo',
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
            : item.rede_particular
              ? 'Privada'
              : 'Pública',
      modality: (item.localizacao as 'Urbana' | 'Rural') || 'Urbana',
      municipality: item.endereco || 'N/A',
      state: 'N/A',
      active: item.ativo,
    }))
  },

  async getSchools(): Promise<School[]> {
    const { data, error } = await supabase
      .from('escolas_instituicoes')
      .select(
        'id, nome_escola, rede_municipal, rede_estadual, rede_federal, rede_particular, localizacao, endereco, ativo',
      )
      .eq('ativo', true)
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
            : item.rede_particular
              ? 'Privada'
              : 'Pública',
      modality: (item.localizacao as 'Urbana' | 'Rural') || 'Urbana',
      municipality: item.endereco || 'N/A',
      state: 'N/A',
      active: item.ativo,
    }))
  },

  async getManagementCommitment(escolaId: string) {
    const { data, error } = await supabase
      .from('compromisso_alta_gestao')
      .select('*')
      .eq('escola_id', escolaId)
      .maybeSingle()

    if (error) throw error
    return data as DocumentRecord | null
  },

  async getCodeOfConduct(escolaId: string) {
    const { data, error } = await supabase
      .from('codigo_conduta')
      .select('*')
      .eq('escola_id', escolaId)
      .maybeSingle()

    if (error) throw error
    return data as DocumentRecord | null
  },

  async uploadEvidence(files: File[]): Promise<string[]> {
    const urls: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('complaint-evidence')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        throw new Error('Falha no upload de evidências. Verifique sua conexão.')
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('complaint-evidence').getPublicUrl(filePath)

      urls.push(publicUrl)
    }

    return urls
  },

  async createComplaint(data: ComplaintData) {
    const protocol = generateProtocol()
    const finalAnonimo = data.anonimo
    const finalDenuncianteId = data.anonimo ? null : data.denunciante_id

    // Use the WORKFLOW_STATUS.REGISTERED ('Denúncia registrada')
    const initialStatus = WORKFLOW_STATUS.REGISTERED

    const { data: result, error } = await supabase
      .from('denuncias')
      .insert({
        escola_id: data.escola_id,
        protocolo: protocol,
        descricao: data.descricao,
        anonimo: finalAnonimo,
        denunciante_id: finalDenuncianteId,
        categoria: data.categoria,
        status: initialStatus,
        envolvidos_detalhes: data.envolvidos_detalhes as any,
        evidencias_urls: data.evidencias_urls,
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
