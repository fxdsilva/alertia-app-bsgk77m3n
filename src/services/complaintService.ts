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

  // Group paths by bucket to fetch signed URLs in bulk and avoid rate limits/slow loading
  const buckets: Record<string, string[]> = {}
  const attachmentMap: Record<string, any> = {}

  for (let index = 0; index < urls.length; index++) {
    let originalUrl = urls[index]
    let url = originalUrl
    let fileName = `Anexo_${index + 1}`
    let type = 'other'

    // Try to parse if it's JSON stringified
    if (url.startsWith('{') && url.endsWith('}')) {
      try {
        const parsed = JSON.parse(url)
        url = parsed.url || parsed.path || url
      } catch (e) {
        // Ignore parse error and keep original url
      }
    }

    try {
      const cleanUrl = url.split('?')[0]
      const decoded = decodeURIComponent(cleanUrl)
      const parts = decoded.split('/')

      if (parts.length > 0 && parts[parts.length - 1]) {
        fileName = parts[parts.length - 1]
        // Clean UUID prefix from filename if present (e.g. "uuid-filename.ext")
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/.test(
            fileName,
          )
        ) {
          fileName = fileName.substring(37)
        }
      }

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
      else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || ''))
        type = 'archive'
      else if (['doc', 'docx'].includes(extension || '')) type = 'document'
      else if (['xls', 'xlsx', 'csv'].includes(extension || ''))
        type = 'spreadsheet'

      let bucket = 'evidencias'
      let path = ''

      if (cleanUrl.includes('/storage/v1/object/')) {
        const bucketAndPathStr = cleanUrl.split('/storage/v1/object/')[1]
        const pathParts = bucketAndPathStr.split('/')
        if (['public', 'sign', 'authenticated'].includes(pathParts[0])) {
          pathParts.shift()
        }
        bucket = pathParts.shift() || 'evidencias'
        path = pathParts.join('/')
      } else if (!cleanUrl.startsWith('http')) {
        const pathParts = cleanUrl.split('/')
        if (['evidencias', 'denuncias', 'anexos'].includes(pathParts[0])) {
          bucket = pathParts.shift() || 'evidencias'
        }
        path = pathParts.join('/')
      }

      const attId = `att_${index}`
      attachmentMap[attId] = {
        id: attId,
        fileName,
        url: originalUrl, // Initial fallback
        type,
        uploadedAt: createdAt,
        bucket,
        path,
      }

      if (path && bucket) {
        if (!buckets[bucket]) buckets[bucket] = []
        buckets[bucket].push(path)
      }
    } catch (e) {
      console.error('Error parsing attachment URL', e)
      attachmentMap[`att_${index}`] = {
        id: `att_${index}`,
        fileName,
        url: originalUrl,
        type: 'other',
        uploadedAt: createdAt,
      }
    }
  }

  // Fetch signed URLs in bulk per bucket
  for (const bucket of Object.keys(buckets)) {
    const paths = buckets[bucket]
    if (paths.length > 0) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrls(paths, 3600)
      if (data) {
        data.forEach((item) => {
          if (item.signedUrl) {
            for (const key of Object.keys(attachmentMap)) {
              if (
                attachmentMap[key].bucket === bucket &&
                attachmentMap[key].path === item.path
              ) {
                attachmentMap[key].url = item.signedUrl
              }
            }
          } else if (item.error) {
            // Fallback to public URL
            for (const key of Object.keys(attachmentMap)) {
              if (
                attachmentMap[key].bucket === bucket &&
                attachmentMap[key].path === item.path
              ) {
                attachmentMap[key].url = supabase.storage
                  .from(bucket)
                  .getPublicUrl(item.path).data.publicUrl
              }
            }
          }
        })
      } else if (error) {
        console.error(`Error creating signed urls for bucket ${bucket}`, error)
        // Fallback to public URLs
        for (const key of Object.keys(attachmentMap)) {
          if (attachmentMap[key].bucket === bucket) {
            attachmentMap[key].url = supabase.storage
              .from(bucket)
              .getPublicUrl(attachmentMap[key].path).data.publicUrl
          }
        }
      }
    }
  }

  // Ensure they are pushed in the original order
  for (let index = 0; index < urls.length; index++) {
    const att = attachmentMap[`att_${index}`]
    attachments.push({
      id: att.id,
      fileName: att.fileName,
      url: att.url,
      type: att.type,
      uploadedAt: att.uploadedAt,
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
