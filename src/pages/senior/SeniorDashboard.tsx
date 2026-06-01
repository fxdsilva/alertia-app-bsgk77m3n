import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  AlertTriangle,
  FileCheck,
  SearchCheck,
  Gavel,
  BrainCircuit,
  Building2,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'

export default function SeniorDashboard() {
  const navigate = useNavigate()
  const [loadingTrainings, setLoadingTrainings] = useState(false)

  const handleTrainingsClick = () => {
    setLoadingTrainings(true)
    setTimeout(() => {
      navigate('/trainings')
    }, 400)
  }

  const modules = [
    {
      title: 'Visão Consolidada',
      description: 'Métricas globais de todas as escolas da rede.',
      icon: Building2,
      path: '/senior/consolidated',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Decisões Disciplinares',
      description: 'Acompanhamento de medidas e sanções aplicadas.',
      icon: Gavel,
      path: '/senior/decisions',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Due Diligence',
      description: 'Análise de integridade de fornecedores e parceiros.',
      icon: SearchCheck,
      path: '/senior/due-diligence',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Relatórios IA',
      description:
        'Análise preditiva e insights gerados por inteligência artificial.',
      icon: BrainCircuit,
      path: '/senior/ai-reports',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Master
          </h1>
          <p className="text-gray-500 mt-1">
            Visão executiva e controle global da rede de ensino.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {modules.map((mod) => (
          <Card
            key={mod.title}
            className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-transparent hover:border-t-primary"
            onClick={() => navigate(mod.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{mod.title}</CardTitle>
              <div className={`p-2 rounded-lg ${mod.bgColor}`}>
                <mod.icon className={`h-4 w-4 ${mod.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mt-2">
                {mod.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle>Capacitação / Portal de Cursos</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Acompanhe o progresso e gerencie os treinamentos de compliance em
              todas as escolas da rede.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Adesão Global
                  </span>
                  <span className="text-sm font-bold text-indigo-700">78%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: '78%' }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto pt-4">
            <Button
              className="w-full flex justify-between items-center group"
              onClick={handleTrainingsClick}
              disabled={loadingTrainings}
            >
              <span>Acessar treinamentos</span>
              {loadingTrainings ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Other operational cards... */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-100 text-red-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <CardTitle>Denúncias e Casos</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Supervisão de denúncias graves e investigações abertas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-slate-600">
                  Abertas (Alta Gravidade)
                </span>
                <span className="font-bold text-red-600">12</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-slate-600">Em Investigação</span>
                <span className="font-bold text-amber-600">45</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto pt-4">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center group"
              onClick={() => navigate('/admin/complaints')}
            >
              <span>Ver painel de denúncias</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                <FileCheck className="h-5 w-5" />
              </div>
              <CardTitle>Auditorias Globais</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Acompanhamento de processos de auditoria nas unidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-slate-600">Agendadas</span>
                <span className="font-bold text-slate-900">8</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-slate-600">Com Pendências</span>
                <span className="font-bold text-amber-600">3</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto pt-4">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center group"
              onClick={() => navigate('/manager/audits')}
            >
              <span>Ver cronograma de auditorias</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
