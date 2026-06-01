import { useNavigate } from 'react-router-dom'
import { useTrainings } from '@/hooks/use-trainings'
import { TrainingCard } from '@/components/trainings/TrainingCard'
import { TrainingLayout } from '@/components/trainings/TrainingLayout'
import { Loader2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TrainingsPage() {
  const navigate = useNavigate()
  const { trainings, loading, error, refetch } = useTrainings()

  const handleCardClick = (id: string) => {
    navigate(`/trainings/${id}`)
  }

  if (loading) {
    return (
      <TrainingLayout
        title="Treinamentos e Capacitações"
        description="Acesse os módulos educativos e conteúdos de compliance."
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Carregando treinamentos...</p>
        </div>
      </TrainingLayout>
    )
  }

  if (error) {
    return (
      <TrainingLayout
        title="Treinamentos e Capacitações"
        description="Acesse os módulos educativos e conteúdos de compliance."
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive bg-destructive/5 rounded-xl border border-destructive/20 p-6 text-center">
          <p className="font-semibold mb-2">Erro ao carregar treinamentos</p>
          <p className="text-sm opacity-90 mb-4">{error.message}</p>
          <Button
            onClick={refetch}
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10"
          >
            Tentar Novamente
          </Button>
        </div>
      </TrainingLayout>
    )
  }

  return (
    <TrainingLayout
      title="Treinamentos e Capacitações"
      description="Acesse os módulos educativos e conteúdos de compliance disponíveis para o seu perfil."
    >
      {trainings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/30 rounded-xl border border-border border-dashed p-8 text-center animate-fade-in-up">
          <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum treinamento disponível
          </h3>
          <p className="text-muted-foreground max-w-md">
            No momento, não há módulos de capacitação ativos ou atribuídos ao
            seu perfil.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </TrainingLayout>
  )
}
