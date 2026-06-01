import { supabase } from '@/lib/supabase/client'

export interface SchoolMetric {
  id: string
  name: string
  network: string // e.g. "Municipal", "Estadual"
  sphere: 'Pública' | 'Privada'
  address: string
  municipality: string
  complaintsCount: number
  investigationsCount: number
  mediationsCount: number
  trainingsCount: number
}

export interface DashboardSummary {
  schools: SchoolMetric[]
  totalSchools: number
  totalComplaints: number
  totalInvestigations: number
  totalMediations: number
  totalTrainings: number
}

export interface SecretaryDashboardConfig {
  welcomeMessage: string
  showStats: boolean
  showSchools: boolean
  showReports: boolean
  customLinks: { title: string; url: string }[]
}

export interface ShareAppConfig {
  enabled: boolean
  title: string
  description: string
  url: string
}

export const secretaryService = {
  async getSecretaryConfig(): Promise<SecretaryDashboardConfig | null> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('settings')
      .eq('key', 'secretary_dashboard_config')
      .maybeSingle()

    if (error) {
      console.error('Error fetching secretary config:', error)
      return null
    }
    return data?.settings as unknown as SecretaryDashboardConfig
  },

  async updateSecretaryConfig(config: SecretaryDashboardConfig): Promise<void> {
    const { error } = await supabase.from('admin_settings').upsert(
      {
        key: 'secretary_dashboard_config',
        settings: config as any,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' },
    )

    if (error) throw error
  },

  async getShareAppConfig(): Promise<ShareAppConfig | null> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('settings')
      .eq('key', 'secretary_share_app_config')
      .maybeSingle()

    if (error) {
      console.error('Error fetching share app config:', error)
      return null
    }
    return data?.settings as unknown as ShareAppConfig
  },

  async getDashboardData(): Promise<DashboardSummary> {
    try {
      const { data, error } = await supabase.rpc(
        'get_secretary_dashboard_stats',
      )

      if (error) throw error

      const rawData = data as any
      const rawSchools = rawData.schools || []

      const schools: SchoolMetric[] = rawSchools.map((school: any) => {
        let network = 'Outra'
        if (school.rede_municipal) network = 'Municipal'
        else if (school.rede_estadual) network = 'Estadual'
        else if (school.rede_federal) network = 'Federal'
        else if (school.rede_particular) network = 'Particular'

        const sphere = school.rede_particular ? 'Privada' : 'Pública'

        return {
          id: school.id,
          name: school.nome_escola,
          network,
          sphere,
          address: school.endereco || '',
          municipality: school.localizacao || '',
          complaintsCount: school.complaintsCount || 0,
          investigationsCount: school.investigationsCount || 0,
          mediationsCount: school.mediationsCount || 0,
          trainingsCount: school.trainingsCount || 0,
        }
      })

      const totalComplaints = schools.reduce(
        (sum, s) => sum + s.complaintsCount,
        0,
      )
      const totalInvestigations = schools.reduce(
        (sum, s) => sum + s.investigationsCount,
        0,
      )
      const totalMediations = schools.reduce(
        (sum, s) => sum + s.mediationsCount,
        0,
      )
      const totalTrainings = schools.reduce(
        (sum, s) => sum + s.trainingsCount,
        0,
      )

      return {
        schools,
        totalSchools: schools.length,
        totalComplaints,
        totalInvestigations,
        totalMediations,
        totalTrainings,
      }
    } catch (error) {
      console.error('Error fetching secretary dashboard data:', error)
      throw error
    }
  },
}
