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

export const secretaryService = {
  async getDashboardData(): Promise<DashboardSummary> {
    try {
      // 1. Fetch all schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('escolas_instituicoes')
        .select('*')
        .eq('ativo', true)
        .order('nome_escola')

      if (schoolsError) throw schoolsError

      // 2. Fetch all active complaints (not archived or resolved)
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('denuncias')
        .select('escola_id, status')
        .not('status', 'in', '("arquivado","resolvido")')

      if (complaintsError) throw complaintsError

      // 3. Fetch all active investigations
      const { data: investigationsData, error: invError } = await supabase
        .from('investigacoes')
        .select('escola_id, status')
        .neq('status', 'concluida')

      if (invError) throw invError

      // 4. Fetch active mediations
      const { data: mediationsData, error: medError } = await supabase
        .from('mediacoes')
        .select('escola_id, status')
        .neq('status', 'concluido')

      if (medError) throw medError

      // 5. Fetch active trainings (programs available)
      const { data: trainingsData, error: trainError } = await supabase
        .from('treinamentos')
        .select('escola_id, ativo')
        .eq('ativo', true)

      if (trainError) throw trainError

      // Aggregation Maps
      const complaintsMap = new Map<string, number>()
      complaintsData?.forEach((c) => {
        if (c.escola_id) {
          complaintsMap.set(
            c.escola_id,
            (complaintsMap.get(c.escola_id) || 0) + 1,
          )
        }
      })

      const investigationsMap = new Map<string, number>()
      investigationsData?.forEach((i) => {
        const id = i.escola_id
        if (id) {
          investigationsMap.set(id, (investigationsMap.get(id) || 0) + 1)
        }
      })

      const mediationsMap = new Map<string, number>()
      mediationsData?.forEach((m) => {
        if (m.escola_id) {
          mediationsMap.set(
            m.escola_id,
            (mediationsMap.get(m.escola_id) || 0) + 1,
          )
        }
      })

      const trainingsMap = new Map<string, number>()
      trainingsData?.forEach((t) => {
        if (t.escola_id) {
          trainingsMap.set(
            t.escola_id,
            (trainingsMap.get(t.escola_id) || 0) + 1,
          )
        }
      })

      // Map schools to SchoolMetric
      const schools: SchoolMetric[] = (schoolsData || []).map((school) => {
        // Determine network string
        let network = 'Outra'
        if (school.rede_municipal) network = 'Municipal'
        else if (school.rede_estadual) network = 'Estadual'
        else if (school.rede_federal) network = 'Federal'
        else if (school.rede_particular) network = 'Particular'

        // Determine sphere
        const sphere = school.rede_particular ? 'Privada' : 'Pública'

        return {
          id: school.id,
          name: school.nome_escola,
          network,
          sphere,
          address: school.endereco || '',
          municipality: school.localizacao || '',
          complaintsCount: complaintsMap.get(school.id) || 0,
          investigationsCount: investigationsMap.get(school.id) || 0,
          mediationsCount: mediationsMap.get(school.id) || 0,
          trainingsCount: trainingsMap.get(school.id) || 0,
        }
      })

      // Calculate totals based on the fetched raw data
      const totalComplaints = complaintsData?.length || 0
      const totalInvestigations = investigationsData?.length || 0
      const totalMediations = mediationsData?.length || 0
      const totalTrainings = trainingsData?.length || 0

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
