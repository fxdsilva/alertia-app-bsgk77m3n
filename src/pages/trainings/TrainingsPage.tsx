import useAppStore from '@/stores/useAppStore'
import TrainingManager from '@/pages/admin/TrainingManager'
import TrainingConsumerList from '@/pages/trainings/TrainingConsumerList'

export default function TrainingsPage() {
  const { profile } = useAppStore()

  const isManager = [
    'administrador',
    'admin_gestor',
    'senior',
    'gestao_escola',
    'DIRETOR_COMPLIANCE',
    'ANALISTA_COMPLIANCE',
  ].includes(profile || '')

  if (isManager) {
    return <TrainingManager />
  }

  return <TrainingConsumerList />
}
