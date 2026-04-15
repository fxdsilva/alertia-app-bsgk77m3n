import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  PlayCircle,
  CheckCircle,
  Clock,
  BookOpen,
  HelpCircle,
} from 'lucide-react'
import { TrainingWithProgress } from '@/services/trainingService'
import { cn } from '@/lib/utils'

interface TrainingCardProps {
  training: TrainingWithProgress
  onClick: (id: string) => void
}

export function TrainingCard({ training, onClick }: TrainingCardProps) {
  const isCompleted =
    training.progress === 100 ||
    training.status === 'concluido' ||
    training.status === 'Concluído'
  const isStarted = training.progress > 0 && !isCompleted

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-border group">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
        <div className="flex justify-between items-start mb-3 gap-2">
          <Badge
            variant={training.obrigatorio ? 'destructive' : 'secondary'}
            className={cn(
              training.obrigatorio
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
            )}
          >
            {training.obrigatorio ? 'Obrigatório' : 'Opcional'}
          </Badge>
          {isCompleted ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 gap-1"
            >
              <CheckCircle className="h-3 w-3" /> Concluído
            </Badge>
          ) : isStarted ? (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 gap-1"
            >
              <Clock className="h-3 w-3" /> Em Andamento
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200 gap-1"
            >
              Não Iniciado
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          {training.tipo_conteudo === 'pdf' ? (
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 gap-1"
            >
              <BookOpen className="h-3 w-3" /> PDF
            </Badge>
          ) : training.tipo_conteudo === 'questionario' ? (
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200 gap-1"
            >
              <HelpCircle className="h-3 w-3" /> Questionário
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 gap-1"
            >
              <PlayCircle className="h-3 w-3" /> Link Externo
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-primary transition-colors">
          {training.titulo}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pt-6 space-y-6">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {training.descricao || 'Nenhuma descrição disponível.'}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Progresso</span>
            <span>{training.progress}%</span>
          </div>
          <Progress value={training.progress} className="h-2.5 bg-secondary" />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/5 pt-4 pb-6 border-t border-border/50">
        {isCompleted ? (
          <Button
            variant="outline"
            className="w-full gap-2 cursor-default bg-green-50/50 hover:bg-green-50 border-green-200 text-green-700"
            onClick={() => onClick(training.id)}
          >
            Revisar Conteúdo
          </Button>
        ) : (
          <Button
            className="w-full gap-2 shadow-sm font-semibold transition-all hover:scale-[1.02]"
            onClick={() => onClick(training.id)}
            size="lg"
          >
            <PlayCircle className="h-5 w-5 fill-current" />
            {isStarted ? 'Continuar' : 'Acessar Conteúdo'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
