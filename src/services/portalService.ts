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
  // New identification fields
  denunciante_nome?: string | null
  denunciante_email?: string | null
  denunciante_telefone?: string | null
  denunciante_vinculo?: string | null
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

// Helper to retry operations on network failure
async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    // Retry on network errors or specific fetch failures
    if (
      retries > 0 &&
      (error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('Network request failed') ||
        error?.status === 503 ||
        error?.status === 504)
    ) {
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchWithRetry(operation, retries - 1, delay * 1.5)
    }
    throw error
  }
}

export const portalService = {
  async searchSchools(query: string): Promise<School[]> {
    if (!query.trim()) return []

    return fetchWithRetry(async () => {
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
    })
  },

  async getSchools(): Promise<School[]> {
    return fetchWithRetry(async () => {
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
    })
  },

  async getManagementCommitment(escolaId: string) {
    return fetchWithRetry(async () => {
      const { data, error } = await supabase
        .from('compromisso_alta_gestao')
        .select('*')
        .eq('escola_id', escolaId)
        .maybeSingle()

      if (error) throw error
      return data as DocumentRecord | null
    })
  },

  async getCodeOfConduct(escolaId: string) {
    return fetchWithRetry(async () => {
      const { data, error } = await supabase
        .from('codigo_conduta')
        .select('*')
        .eq('escola_id', escolaId)
        .maybeSingle()

      if (error) throw error
      return data as DocumentRecord | null
    })
  },

  async getStatusId(name: string): Promise<string> {
    return fetchWithRetry(async () => {
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
        console.error(
          `CRITICAL: Status "${name}" not found in database. Please run migrations.`,
        )
        throw new Error(
          `Configuração de sistema incompleta: Status "${name}" não encontrado.`,
        )
      }

      return data.id
    })
  },

  async uploadEvidence(files: File[]): Promise<string[]> {
    const urls: string[] = []

    for (const file of files) {
      const nameParts = file.name.split('.')
      const fileExt = nameParts.length > 1 ? nameParts.pop() : 'bin'
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`

      try {
        const fileBuffer = await file.arrayBuffer()

        const { data, error: uploadError } = await supabase.storage
          .from('complaint-evidence')
          .upload(fileName, fileBuffer, {
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
        throw new Error(
          errorMessage || `Falha ao fazer upload do arquivo ${file.name}`,
        )
      }
    }

    return urls
  },

  async createComplaint(data: ComplaintData) {
    const protocolo = generateProtocol()
    const finalDenuncianteId = data.anonimo ? null : data.denunciante_id || null

    return fetchWithRetry(async () => {
      try {
        const initialStatusId = await this.getStatusId(
          WORKFLOW_STATUS.REGISTERED,
        )

        const insertPayload: any = {
          escola_id: data.escola_id,
          protocolo: protocolo,
          descricao: data.descricao,
          anonimo: data.anonimo,
          denunciante_id: finalDenuncianteId,
          categoria: data.categoria,
          status: initialStatusId,
          envolvidos_detalhes: data.envolvidos_detalhes as any,
          evidencias_urls: data.evidencias_urls,
        }

        // Add identification fields if provided and not anonymous
        if (!data.anonimo) {
          insertPayload.denunciante_nome = data.denunciante_nome
          insertPayload.denunciante_email = data.denunciante_email
          insertPayload.denunciante_telefone = data.denunciante_telefone
          insertPayload.denunciante_vinculo = data.denunciante_vinculo
        }

        const { data: result, error } = await supabase
          .from('denuncias')
          .insert(insertPayload)
          .select()
          .single()

        if (error) {
          const msg = getErrorMessage(error)
          console.error('Error creating complaint:', msg)
          throw new Error(msg)
        }

        this.triggerAutoTransition(result.id, initialStatusId).catch((err) =>
          console.error('Auto transition warning:', err),
        )

        return {
          ...result,
          protocolo: result?.protocolo || protocolo,
        }
      } catch (err) {
        const msg = getErrorMessage(err)
        console.error('Unexpected error in createComplaint:', msg)
        throw new Error(msg)
      }
    })
  },

  async triggerAutoTransition(complaintId: string, initialStatusId: string) {
    try {
      const nextStatusId = await this.getStatusId(
        WORKFLOW_STATUS.WAITING_ANALYST_1,
      )

      const { error: transitionError } = await supabase
        .from('denuncias')
        .update({ status: nextStatusId })
        .eq('id', complaintId)

      if (!transitionError) {
        await supabase.from('compliance_workflow_logs').insert({
          complaint_id: complaintId,
          previous_status: initialStatusId,
          new_status: nextStatusId,
          comments: 'Transição automática de entrada (Portal)',
        })
      }
    } catch (error) {
      console.warn('Auto transition background process failed/skipped:', error)
    }
  },

  async getComplaintStatus(protocol: string) {
    return fetchWithRetry(async () => {
      const { data, error } = await supabase.rpc('get_complaint_by_protocol', {
        protocol_query: protocol,
      })

      if (error) throw error
      return data && data.length > 0 ? data[0] : null
    })
  },
}

function generateProtocol() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(100000 + Math.random() * 900000)
  return `${date}-${random}`
}
