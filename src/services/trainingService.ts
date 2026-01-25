import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Training = Database['public']['Tables']['treinamentos']['Row']

export interface TrainingWithProgress extends Training {
  status: string
  progress: number
  conclusion_date?: string | null
}

export const trainingService = {
  async getPublicTrainings(schoolId: string) {
    const { data, error } = await supabase
      .from('treinamentos')
      .select('*')
      .eq('escola_id', schoolId)
      .eq('ativo', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getTrainingById(id: string) {
    const { data, error } = await supabase
      .from('treinamentos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getTrainingsWithProgress(
    schoolId: string,
    userId: string,
  ): Promise<TrainingWithProgress[]> {
    // 1. Fetch active trainings assigned to the school
    const { data: trainings, error: trainingError } = await supabase
      .from('treinamentos')
      .select('*')
      .eq('escola_id', schoolId)
      .eq('ativo', true)
      .order('created_at', { ascending: false })

    if (trainingError) throw trainingError

    // 2. Fetch user's progress for these trainings
    // We join with the status table to get the readable status name
    const { data: progressData, error: progressError } = await supabase
      .from('treinamentos_conclusoes')
      .select(
        `
        *,
        status_treinamento_conclusao (
          nome_status
        )
      `,
      )
      .eq('usuario_id', userId)

    if (progressError) throw progressError

    // 3. Merge data
    return trainings.map((training) => {
      // Find matching progress record
      const userProgress = progressData?.find(
        (p) => p.treinamento_id === training.id,
      )

      // Extract status name safely
      // Supabase returns the relation as an object or null
      const statusInfo =
        userProgress?.status_treinamento_conclusao as unknown as {
          nome_status: string
        } | null
      const statusName =
        statusInfo?.nome_status || userProgress?.status || 'Não Iniciado'

      return {
        ...training,
        status: userProgress ? statusName : 'Não Iniciado',
        progress: userProgress?.progresso || 0,
        conclusion_date: userProgress?.data_conclusao,
      }
    })
  },
}
