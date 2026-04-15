import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrainings } from '@/hooks/use-trainings'
import { TrainingCard } from '@/components/trainings/TrainingCard'
import { TrainingLayout } from '@/components/trainings/TrainingLayout'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function TrainingConsumerList() {
  const { trainings, loading } = useTrainings()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      const matchesSearch =
        t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())

      let matchesStatus = true
      const isCompleted =
        t.progress === 100 ||
        t.status === 'concluido' ||
        t.status === 'Concluído'
      const isStarted = t.progress > 0 && !isCompleted

      if (filterStatus === 'completed') matchesStatus = isCompleted
      if (filterStatus === 'progress') matchesStatus = isStarted
      if (filterStatus === 'pending') matchesStatus = !isStarted && !isCompleted

      return matchesSearch && matchesStatus
    })
  }, [trainings, searchTerm, filterStatus])

  if (loading) {
    return (
      <TrainingLayout title="Capacitação">
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TrainingLayout>
    )
  }

  return (
    <TrainingLayout
      title="Capacitação"
      description="Área dedicada ao seu desenvolvimento profissional."
    >
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar treinamentos..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Não Iniciados</SelectItem>
            <SelectItem value="progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTrainings.length === 0 ? (
        <Card className="border-dashed bg-muted/30 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-white p-6 rounded-full shadow-sm">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Nenhum treinamento encontrado.
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Tente ajustar os filtros ou aguarde novas capacitações.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrainings.map((t) => (
            <TrainingCard
              key={t.id}
              training={t}
              onClick={(id) => navigate(`/trainings/${id}`)}
            />
          ))}
        </div>
      )}
    </TrainingLayout>
  )
}
