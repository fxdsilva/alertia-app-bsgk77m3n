import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PlayCircle,
  CheckCircle,
  GraduationCap,
  Loader2,
  BookOpen,
} from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import {
  trainingService,
  TrainingWithProgress,
} from '@/services/trainingService'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Training() {
  const { selectedSchool, user } = useAppStore()
  const [trainings, setTrainings] = useState<TrainingWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedSchool && user) {
      fetchTrainings()
    }
  }, [selectedSchool, user])

  const fetchTrainings = async () => {
    if (!selectedSchool || !user) return
    setLoading(true)
    try {
      const data = await trainingService.getTrainingsWithProgress(
        selectedSchool.id,
        user.id,
      )
      setTrainings(data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar seus treinamentos.')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = (url: string | null) => {
    if (url) {
      window.open(url, '_blank')
    } else {
      toast.info('O conteúdo deste treinamento estará disponível em breve.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!selectedSchool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-muted p-4 rounded-full">
          <GraduationCap className="h-12 w-12 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-xl font-semibold">Sem vínculo escolar</h2>
        <p className="text-muted-foreground">
          Você precisa estar vinculado a uma escola para visualizar
          treinamentos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in p-6 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Meus Treinamentos
        </h1>
        <p className="text-muted-foreground text-lg">
          Área dedicada ao seu desenvolvimento profissional e conformidade na{' '}
          <span className="font-semibold text-foreground">
            {selectedSchool.name}
          </span>
          .
        </p>
      </div>

      {trainings.length === 0 ? (
        <Card className="border-dashed bg-muted/30 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-white p-6 rounded-full shadow-sm">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Ainda não há cursos liberados para o seu perfil.
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Novos treinamentos e capacitações atribuídos pela direção
                aparecerão aqui automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trainings.map((t) => {
            const isCompleted = t.status === 'Concluído' || t.progress === 100

            return (
              <Card
                key={t.id}
                className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-border group"
              >
                <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <Badge
                      variant={t.obrigatorio ? 'destructive' : 'secondary'}
                      className={
                        t.obrigatorio
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
                      }
                    >
                      {t.obrigatorio ? 'Obrigatório' : 'Opcional'}
                    </Badge>
                    {isCompleted && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 gap-1"
                      >
                        <CheckCircle className="h-3 w-3" /> Concluído
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-primary transition-colors">
                    {t.titulo}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 pt-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {t.data_fim ? (
                      <span>
                        Prazo: {format(new Date(t.data_fim), 'dd/MM/yyyy')}
                      </span>
                    ) : (
                      <span>Prazo Indefinido</span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pt-6 space-y-6">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {t.descricao ||
                      'Nenhuma descrição disponível para este módulo.'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>Progresso</span>
                      <span>{t.progress}%</span>
                    </div>
                    <Progress
                      value={t.progress}
                      className="h-2.5 bg-secondary"
                    />
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/5 pt-4 pb-6 border-t border-border/50">
                  {isCompleted ? (
                    <Button
                      variant="outline"
                      className="w-full gap-2 cursor-default bg-green-50/50 hover:bg-green-50 border-green-200 text-green-700"
                      disabled
                    >
                      <CheckCircle className="h-4 w-4" />
                      Certificado Disponível
                    </Button>
                  ) : (
                    <Button
                      className="w-full gap-2 shadow-sm font-semibold text-white transition-all hover:scale-[1.02]"
                      onClick={() => handleStart(t.conteudo_url)}
                      size="lg"
                    >
                      <PlayCircle className="h-5 w-5 fill-current" />
                      {t.progress > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
