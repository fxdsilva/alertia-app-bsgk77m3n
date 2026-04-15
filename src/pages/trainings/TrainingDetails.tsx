import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTraining } from '@/hooks/use-trainings'
import { TrainingLayout } from '@/components/trainings/TrainingLayout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { trainingService } from '@/services/trainingService'
import useAppStore from '@/stores/useAppStore'
import { toast } from 'sonner'

export default function TrainingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const { training, loading, error } = useTraining(id || '')
  const [completing, setCompleting] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  if (loading) {
    return (
      <TrainingLayout title="Detalhes do Treinamento">
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TrainingLayout>
    )
  }

  if (error || !training) {
    return (
      <TrainingLayout title="Erro">
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">Erro ao carregar o treinamento.</p>
          <Button onClick={() => navigate('/trainings')}>Voltar</Button>
        </div>
      </TrainingLayout>
    )
  }

  const handleComplete = async () => {
    if (!user) return
    setCompleting(true)
    try {
      await trainingService.markAsCompleted(training.id, user.id)
      toast.success('Treinamento concluído com sucesso!')
      navigate('/trainings')
    } catch (err) {
      toast.error('Erro ao registrar conclusão.')
    } finally {
      setCompleting(false)
    }
  }

  const handleAccessContent = () => {
    if (training.conteudo_url) {
      window.open(training.conteudo_url, '_blank')
      if (training.tipo_conteudo !== 'questionario') {
        handleComplete()
      }
    }
  }

  return (
    <TrainingLayout title={training.titulo}>
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate('/trainings')}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre este conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">
                {training.descricao || 'Sem descrição.'}
              </p>
            </CardContent>
          </Card>

          {training.tipo_conteudo === 'questionario' && training.questoes && (
            <Card>
              <CardHeader>
                <CardTitle>Questionário de Avaliação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(training.questoes as any[]).map((q: any, i: number) => (
                  <div
                    key={i}
                    className="space-y-3 bg-slate-50 p-4 rounded-lg border"
                  >
                    <p className="font-medium text-slate-800">
                      {i + 1}. {q.pergunta}
                    </p>
                    <div className="space-y-2">
                      {q.opcoes?.map((opt: string, j: number) => (
                        <label
                          key={j}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`q${i}`}
                            value={opt}
                            checked={answers[i] === opt}
                            onChange={(e) =>
                              setAnswers({ ...answers, [i]: e.target.value })
                            }
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full"
                >
                  {completing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Finalizar Questionário
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {training.tipo_conteudo !== 'questionario' && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAccessContent}
                >
                  Acessar Material
                </Button>
              )}
              {training.tipo_conteudo !== 'questionario' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleComplete}
                  disabled={completing}
                >
                  Marcar como Concluído
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TrainingLayout>
  )
}
