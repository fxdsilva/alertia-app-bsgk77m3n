import { supabase } from '@/lib/supabase/client'

export interface LogEntry {
  id: string
  created_at: string
  user_id: string | null
  action_type: string
  description: string | null
  table_affected: string | null
  metadata: any
}

export const auditService = {
  async logAction(
    action: string,
    description: string,
    tableName?: string,
    metadata?: any,
  ) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const { error } = await supabase.from('logs_sistema').insert({
        user_id: session?.user?.id || null,
        action_type: action,
        description: description,
        table_affected: tableName || null,
        metadata: metadata || null,
      })

      if (error) {
        console.error('Failed to log action:', error)
      }
    } catch (err) {
      console.error('Error logging action:', err)
    }
  },

  async getLogs(filters?: {
    actionType?: string
    userId?: string
    limit?: number
  }) {
    let query = supabase
      .from('logs_sistema')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.actionType) {
      query = query.eq('action_type', filters.actionType)
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    // Default limit to 100 if not specified to prevent overloading
    query = query.limit(filters?.limit || 100)

    const { data, error } = await query
    if (error) throw error
    return data as LogEntry[]
  },
}
