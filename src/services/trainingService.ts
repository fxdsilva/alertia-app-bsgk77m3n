import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Training = Database['public']['Tables']['treinamentos']['Row']

export interface TrainingWithProgress extends Training {
  status: string
  progress: number
  conclusion_date?: string | null
}

export const trainingService = {
  async getTrainings(schoolId: string) {
    return this.getTrainingsBySchool(schoolId)
  },

  async createTraining(training: Partial<Training>) {
    return this.upsertTraining(training)
  },

  async updateTraining(training: Partial<Training>) {
    return this.upsertTraining(training)
  },

  async getTrainingsBySchool(schoolId: string) {
    const { data, error } = await supabase
      .from('treinamentos')
      .select('*')
      .eq('escola_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async upsertTraining(training: Partial<Training>) {
    if (training.id) {
      const { data, error } = await supabase
        .from('treinamentos')
        .update(training)
        .eq('id', training.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('treinamentos')
        .insert(training)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  async deleteTraining(id: string) {
    const { error } = await supabase.from('treinamentos').delete().eq('id', id)
    if (error) throw error
  },

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

  async markAsCompleted(trainingId: string, userId: string) {
    const { data: existing } = await supabase
      .from('treinamentos_conclusoes')
      .select('id')
      .eq('treinamento_id', trainingId)
      .eq('usuario_id', userId)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('treinamentos_conclusoes')
        .update({
          status: 'concluido',
          progresso: 100,
          data_conclusao: new Date().toISOString(),
        })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('treinamentos_conclusoes').insert({
        treinamento_id: trainingId,
        usuario_id: userId,
        status: 'concluido',
        progresso: 100,
        data_conclusao: new Date().toISOString(),
      })
      if (error) throw error
    }
    return true
  },

  async getTrainingsWithProgress(
    schoolId: string,
    userId: string,
  ): Promise<TrainingWithProgress[]> {
    const { data: trainings, error: trainingError } = await supabase
      .from('treinamentos')
      .select('*')
      .eq('escola_id', schoolId)
      .eq('ativo', true)
      .order('created_at', { ascending: false })

    if (trainingError) throw trainingError

    const { data: progressData, error: progressError } = await supabase
      .from('treinamentos_conclusoes')
      .select(`*, status_treinamento_conclusao ( nome_status )`)
      .eq('usuario_id', userId)

    if (progressError) throw progressError

    return trainings.map((training) => {
      const userProgress = progressData?.find(
        (p) => p.treinamento_id === training.id,
      )

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
