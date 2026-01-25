import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  GraduationCap,
  BookOpen,
  Calendar as CalendarIcon,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import {
  trainingService,
  TrainingWithProgress,
} from '@/services/trainingService'

export default function DashboardProfessor() {
  const { user, selectedSchool, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [pendingTrainingsCount, setPendingTrainingsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && selectedSchool) {
      fetchTrainings()
    }
  }, [user, selectedSchool])

  const fetchTrainings = async () => {
    if (!user || !selectedSchool) return
    setLoading(true)
    try {
      const data = await trainingService.getTrainingsWithProgress(
        selectedSchool.id,
        user.id,
      )
      const pending = data.filter(
        (t: TrainingWithProgress) =>
          t.obrigatorio &&
          (t.status === 'Não Iniciado' || t.status === 'Em Andamento'),
      ).length
      setPendingTrainingsCount(pending)
    } catch (error) {
      console.error('Error fetching trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const firstName = user.email?.split('@')[0] || 'Professor'

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground capitalize">
          Olá, {firstName}
        </h1>
        <p className="text-lg text-muted-foreground">
          Painel Acadêmico Simplificado
        </p>
      </div>

      {/* Alert Banner */}
      {!loading && pendingTrainingsCount > 0 && (
        <Alert className="bg-orange-50 border-orange-200 text-orange-900 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-lg font-semibold text-orange-800 mb-2">
            Capacitação Pendente
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Você possui{' '}
              <span className="font-bold">{pendingTrainingsCount}</span>{' '}
              treinamento(s) obrigatório(s) pendente(s). Complete-os para manter
              sua conformidade.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="bg-white border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-800 font-semibold shadow-sm"
              onClick={() => navigate('/professor/trainings')}
            >
              Acessar Agora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Capacitação */}
        <Card
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-orange-400"
          onClick={() => navigate('/professor/trainings')}
        >
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="bg-orange-100 p-3 rounded-xl mb-2 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-8 w-8 text-orange-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 transition-colors" />
            </div>
            <CardTitle className="text-xl">Capacitação</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Acesse o catálogo de treinamentos e realize suas avaliações.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Biblioteca */}
        <Card
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-emerald-400"
          onClick={() => navigate('/professor/library')}
        >
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="bg-emerald-100 p-3 rounded-xl mb-2 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-emerald-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
            </div>
            <CardTitle className="text-xl">Biblioteca</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Guias, manuais de conduta e documentos institucionais.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Agenda */}
        <Card
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-purple-400"
          onClick={() => navigate('/professor/agenda')}
        >
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="bg-purple-100 p-3 rounded-xl mb-2 group-hover:scale-110 transition-transform duration-300">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
            </div>
            <CardTitle className="text-xl">Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Visualize o calendário escolar e eventos programados.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
