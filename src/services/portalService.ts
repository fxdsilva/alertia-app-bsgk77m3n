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

const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Erro desconhecido'
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as any).message)
  }
  if (typeof error === 'string') return error
  return 'Erro desconhecido'
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

  async getStatusId(name: string): Promise<string> {
    const { data, error } = await supabase
      .from('status_denuncia')
      .select('id')
      .eq('nome_status', name)
      .maybeSingle()

    if (error) {
      console.error(
        `Error fetching status ID for ${name}:`,
        getErrorMessage(error),
      )
      throw new Error(`Erro ao buscar status: ${name}`)
    }

    if (!data) {
      throw new Error(`Status não encontrado no sistema: ${name}`)
    }

    return data.id
  },

  async uploadEvidence(files: File[]): Promise<string[]> {
    const urls: string[] = []

    for (const file of files) {
      const nameParts = file.name.split('.')
      const fileExt = nameParts.length > 1 ? nameParts.pop() : 'bin'
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`

      try {
        const { data, error: uploadError } = await supabase.storage
          .from('complaint-evidence')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || 'application/octet-stream',
          })

        if (uploadError) {
          const msg = getErrorMessage(uploadError)
          throw new Error(msg)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('complaint-evidence').getPublicUrl(fileName)

        urls.push(publicUrl)
      } catch (err: any) {
        const errorMessage = getErrorMessage(err)
        console.error(`Evidence upload failed for ${file.name}:`, errorMessage)
        // Throw a clean error string to avoid cloning issues
        throw new Error(
          errorMessage || `Falha ao fazer upload do arquivo ${file.name}`,
        )
      }
    }

    return urls
  },

  async createComplaint(data: ComplaintData) {
    const protocol = generateProtocol()
    const finalDenuncianteId = data.anonimo ? null : data.denunciante_id || null

    try {
      // Fetch Status IDs first to ensure valid FKs
      const initialStatusId = await this.getStatusId(WORKFLOW_STATUS.REGISTERED)

      const { data: result, error } = await supabase
        .from('denuncias')
        .insert({
          escola_id: data.escola_id,
          protocolo: protocol,
          descricao: data.descricao,
          anonimo: data.anonimo,
          denunciante_id: finalDenuncianteId,
          categoria: data.categoria,
          status: initialStatusId, // Use ID, not string
          envolvidos_detalhes: data.envolvidos_detalhes as any,
          evidencias_urls: data.evidencias_urls,
        })
        .select()
        .single()

      if (error) {
        const msg = getErrorMessage(error)
        console.error('Error creating complaint:', msg)
        throw new Error(msg)
      }

      // 2. Immediate Transition to "Aguardando designação..."
      try {
        const nextStatusId = await this.getStatusId(
          WORKFLOW_STATUS.WAITING_ANALYST_1,
        )

        const { error: transitionError } = await supabase
          .from('denuncias')
          .update({ status: nextStatusId })
          .eq('id', result.id)

        if (transitionError) {
          console.error('Failed to auto-transition status', transitionError)
        } else {
          // Log transition
          await supabase.from('compliance_workflow_logs').insert({
            complaint_id: result.id,
            previous_status: initialStatusId, // Best effort logging
            new_status: nextStatusId,
            comments: 'Transição automática de entrada (Portal)',
          })
        }

        return {
          ...result,
          status: transitionError ? initialStatusId : nextStatusId,
          protocolo,
        }
      } catch (transitionErr) {
        console.error('Transition error:', transitionErr)
        // Return result anyway since complaint was created
        return { ...result, protocolo }
      }
    } catch (err) {
      const msg = getErrorMessage(err)
      console.error('Unexpected error in createComplaint:', msg)
      throw new Error(msg)
    }
  },

  async getComplaintStatus(protocol: string) {
    // Note: This RPC might return status names or IDs depending on implementation.
    // If it returns IDs, we might need to fetch the name for display.
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
