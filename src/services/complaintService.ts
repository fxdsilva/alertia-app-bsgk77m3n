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

async function parseAttachments(
  urls: string[] | null,
  createdAt: string,
): Promise<Attachment[]> {
  if (!urls || urls.length === 0) return []

  const attachments: Attachment[] = []

  for (let index = 0; index < urls.length; index++) {
    let url = urls[index]
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
      else if (['mp4', 'webm', 'mov', 'avi'].includes(extension || ''))
        type = 'video'
      else if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension || ''))
        type = 'audio'
      else if (['zip', 'rar', '7z', 'tar'].includes(extension || ''))
        type = 'archive'

      // Generate signed URL if it is a supabase storage URL
      if (url.includes('/storage/v1/object/')) {
        const bucketAndPathStr = url.split('/storage/v1/object/')[1]
        const pathParts = bucketAndPathStr.split('/')
        if (pathParts[0] === 'public' || pathParts[0] === 'sign') {
          pathParts.shift()
        }
        const bucket = pathParts.shift()
        const path = pathParts.join('/')

        if (bucket && path) {
          const { data } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 3600)
          if (data?.signedUrl) {
            url = data.signedUrl
          }
        }
      }
    } catch (e) {
      console.error('Error parsing attachment URL', e)
    }

    attachments.push({
      id: `att_${index}`,
      fileName,
      url,
      type,
      uploadedAt: createdAt,
    })
  }

  return attachments
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

    const result = []
    for (const d of data) {
      result.push({
        ...d,
        escola_nome: d.escolas_instituicoes?.nome_escola,
        status_nome: d.status_denuncia?.nome_status,
        attachments: await parseAttachments(d.evidencias_urls, d.created_at),
      })
    }
    return result as Complaint[]
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
      attachments: await parseAttachments(
        data.evidencias_urls,
        data.created_at,
      ),
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
