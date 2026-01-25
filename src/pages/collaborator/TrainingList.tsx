import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  PlayCircle,
  GraduationCap,
  Loader2,
  Info,
} from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { trainingService, Training } from '@/services/trainingService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function TrainingList() {
  const { selectedSchool } = useAppStore()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedSchool) {
      fetchTrainings()
    } else {
      setLoading(false)
    }
  }, [selectedSchool])

  const fetchTrainings = async () => {
    if (!selectedSchool) return
    setLoading(true)
    try {
      const data = await trainingService.getPublicTrainings(selectedSchool.id)
      setTrainings(data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar catálogo de treinamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTraining = (training: Training) => {
    if (training.conteudo_url) {
      window.open(training.conteudo_url, '_blank')
    } else {
      toast.info('Conteúdo será disponibilizado em breve.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!selectedSchool) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground space-y-4">
        <Info className="h-12 w-12 opacity-50" />
        <p className="text-lg">Você não está vinculado a nenhuma escola.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Catálogo de Treinamentos
        </h1>
        <p className="text-muted-foreground">
          Explore os cursos e capacitações disponíveis na {selectedSchool.name}.
        </p>
      </div>

      {trainings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/20">
          <div className="bg-muted p-4 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Nenhum treinamento disponível
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            No momento não há treinamentos ativos no catálogo. Fique atento às
            novidades.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trainings.map((training) => (
            <Card
              key={training.id}
              className="flex flex-col hover:shadow-md transition-all duration-200 group"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant={training.obrigatorio ? 'destructive' : 'secondary'}
                    className={
                      training.obrigatorio
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200'
                        : ''
                    }
                  >
                    {training.obrigatorio ? 'Obrigatório' : 'Opcional'}
                  </Badge>
                  {training.ativo && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Disponível
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {training.titulo}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs pt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {training.data_inicio && training.data_fim ? (
                    <span>
                      {format(new Date(training.data_inicio), 'dd/MM', {
                        locale: ptBR,
                      })}{' '}
                      até{' '}
                      {format(new Date(training.data_fim), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </span>
                  ) : (
                    <span>Prazo Indefinido</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {training.descricao || 'Sem descrição disponível.'}
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  className="w-full gap-2"
                  onClick={() => handleStartTraining(training)}
                >
                  <PlayCircle className="h-4 w-4" /> Acessar Conteúdo
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
