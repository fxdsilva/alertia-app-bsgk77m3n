import { supabase } from '@/lib/supabase/client'

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
        table_name: tableName || null,
        details: metadata || null,
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
      .select('*, user:user_id(email)')
      .order('created_at', { ascending: false })

    if (filters?.actionType) {
      query = query.eq('action_type', filters.actionType)
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },
}
