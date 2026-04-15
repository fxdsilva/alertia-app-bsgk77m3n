import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Denuncia = Database['public']['Tables']['denuncias']['Row']

export interface Attachment {
  id: string
  fileName: string
  url: string
  type: string
  uploadedAt: string
}

export interface Complaint extends Denuncia {
  escola_nome?: string
  status_nome?: string
  attachments?: Attachment[]
}

function parseAttachments(
  urls: string[] | null,
  createdAt: string,
): Attachment[] {
  if (!urls || urls.length === 0) return []

  return urls.map((url, index) => {
    let fileName = `Anexo_${index + 1}`
    let type = 'other'

    try {
      const cleanUrl = url.split('?')[0]
      const decoded = decodeURIComponent(cleanUrl)
      const parts = decoded.split('/')
      fileName = parts[parts.length - 1] || fileName

      const extension = fileName.split('.').pop()?.toLowerCase()
      if (
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')
      )
        type = 'image'
      else if (extension === 'pdf') type = 'pdf'
      else if (['mp4', 'webm', 'mov'].includes(extension || '')) type = 'video'
      else if (['mp3', 'wav', 'ogg'].includes(extension || '')) type = 'audio'
      else if (['zip', 'rar', '7z', 'tar'].includes(extension || ''))
        type = 'archive'
    } catch (e) {
      // fallback
    }

    return {
      id: `att_${index}`,
      fileName,
      url,
      type,
      uploadedAt: createdAt,
    }
  })
}

export const complaintService = {
  async getComplaints(filters?: {
    status?: string
    escola_id?: string
    analista_id?: string
  }) {
    let query = supabase
      .from('denuncias')
      .select(
        `
        *,
        escolas_instituicoes (nome_escola),
        status_denuncia (nome_status)
      `,
      )
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.escola_id) {
      query = query.eq('escola_id', filters.escola_id)
    }
    if (filters?.analista_id) {
      query = query.eq('analista_id', filters.analista_id)
    }

    const { data, error } = await query
    if (error) throw error

    return data.map((d: any) => ({
      ...d,
      escola_nome: d.escolas_instituicoes?.nome_escola,
      status_nome: d.status_denuncia?.nome_status,
      attachments: parseAttachments(d.evidencias_urls, d.created_at),
    })) as Complaint[]
  },

  async getComplaintById(id: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .select(
        `
        *,
        escolas_instituicoes (nome_escola),
        status_denuncia (nome_status)
      `,
      )
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      ...data,
      escola_nome: data.escolas_instituicoes?.nome_escola,
      status_nome: data.status_denuncia?.nome_status,
      attachments: parseAttachments(data.evidencias_urls, data.created_at),
    } as Complaint
  },

  async updateComplaintStatus(id: string, statusId: string) {
    const { data, error } = await supabase
      .from('denuncias')
      .update({ status: statusId })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
