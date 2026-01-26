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

export interface SupportContactInfo {
  email: string
  phone: string
  whatsapp: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
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

  async getSupportContactInfo(): Promise<SupportContactInfo | null> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('settings')
      .eq('key', 'support_contact_info')
      .maybeSingle()

    if (error) {
      console.error('Error fetching support contact info:', error)
      return null
    }

    return data?.settings as unknown as SupportContactInfo
  },

  async updateSupportContactInfo(info: SupportContactInfo): Promise<void> {
    const { error } = await supabase.from('admin_settings').upsert(
      {
        key: 'support_contact_info',
        settings: info,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    )

    if (error) throw error
  },

  async getSupportFAQs(): Promise<FAQItem[] | null> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('settings')
      .eq('key', 'support_faqs')
      .maybeSingle()

    if (error) {
      console.error('Error fetching support FAQs:', error)
      return null
    }

    return data?.settings as unknown as FAQItem[]
  },

  async updateSupportFAQs(faqs: FAQItem[]): Promise<void> {
    const { error } = await supabase.from('admin_settings').upsert(
      {
        key: 'support_faqs',
        settings: faqs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    )

    if (error) throw error
  },
}
