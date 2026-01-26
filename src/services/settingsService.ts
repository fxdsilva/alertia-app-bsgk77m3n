import { supabase } from '@/lib/supabase/client'

export interface OfficialChannel {
  name: string
  description: string
  url: string
  label?: string
}

export interface EmergencyContact {
  number: string
  name: string
  description?: string
}

export interface OfficialChannelsData {
  mato_grosso: OfficialChannel[]
  brasil: OfficialChannel[]
  emergency?: EmergencyContact[]
}

export const settingsService = {
  async getOfficialChannels(): Promise<OfficialChannelsData | null> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('settings')
      .eq('key', 'external_official_channels')
      .maybeSingle()

    if (error) {
      console.error('Error fetching official channels:', error)
      return null
    }

    if (!data) return null

    return data.settings as unknown as OfficialChannelsData
  },
}
