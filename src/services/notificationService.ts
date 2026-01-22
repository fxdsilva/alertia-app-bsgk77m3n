import { supabase } from '@/lib/supabase/client'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
  link?: string
  created_at: string
}

export const notificationService = {
  async getNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
    return data as Notification[]
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) throw error
  },

  async markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) throw error
  },

  async createNotification(
    notification: Omit<Notification, 'id' | 'created_at' | 'read'>,
  ) {
    const { error } = await supabase.from('notifications').insert(notification)

    if (error) throw error
  },

  async deleteNotification(id: string) {
    const { error } = await supabase.from('notifications').delete().eq('id', id)

    if (error) throw error
  },
}
