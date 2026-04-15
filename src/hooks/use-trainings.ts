import { useState, useEffect, useCallback } from 'react'
import {
  trainingService,
  Training,
  TrainingWithProgress,
} from '@/services/trainingService'
import useAppStore from '@/stores/useAppStore'

export function useTrainings() {
  const { selectedSchool, user } = useAppStore()
  const [trainings, setTrainings] = useState<TrainingWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTrainings = useCallback(async () => {
    if (!selectedSchool || !user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await trainingService.getTrainingsWithProgress(
        selectedSchool.id,
        user.id,
      )
      setTrainings(data)
      setError(null)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [selectedSchool, user])

  useEffect(() => {
    fetchTrainings()
  }, [fetchTrainings])

  return { trainings, loading, error, refetch: fetchTrainings }
}

export function useTraining(id: string) {
  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTraining = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await trainingService.getTrainingById(id)
        setTraining(data)
        setError(null)
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTraining()
  }, [id])

  return { training, loading, error }
}
