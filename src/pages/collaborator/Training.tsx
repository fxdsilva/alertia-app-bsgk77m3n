import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { PlayCircle, CheckCircle } from 'lucide-react'
import { mockTrainingModules } from '@/lib/mockData'

export default function Training() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Treinamentos e Capacitação</h1>
        <Button variant="outline">Meus Certificados</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockTrainingModules.map((module) => (
          <Card key={module.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription>Obrigatório</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>{module.progress}%</span>
                </div>
                <Progress value={module.progress} />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${module.status === 'Concluído' ? 'text-green-600' : 'text-primary'}`}
                >
                  {module.status}
                </span>
                {module.status === 'Concluído' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Button size="sm" className="gap-2">
                    <PlayCircle className="h-4 w-4" /> Continuar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
