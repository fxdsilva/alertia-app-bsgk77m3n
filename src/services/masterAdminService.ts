import { supabase } from '@/lib/supabase/client'

export const masterAdminService = {
  async getNotificationSettings() {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('key', 'notification_preferences')
      .maybeSingle()

    if (error) {
      console.error('Error fetching notification settings:', error)
      return null
    }

    return data
  },

  async updateNotificationSettings(settings: any) {
    const { error } = await supabase.from('admin_settings').upsert(
      {
        key: 'notification_preferences',
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    )

    if (error) throw error
  },
}
