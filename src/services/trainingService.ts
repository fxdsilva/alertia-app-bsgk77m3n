import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Training = Database['public']['Tables']['treinamentos']['Row']

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
}
