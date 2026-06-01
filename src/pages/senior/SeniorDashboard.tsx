import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  BookOpen,
  Presentation,
  ShieldAlert,
  BarChart3,
  Users,
  Loader2,
  LayoutDashboard,
} from 'lucide-react'

export default function SeniorDashboard() {
  const navigate = useNavigate()
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null)

  const handleNavigation = (route: string) => {
    setLoadingRoute(route)
    // Simulate slight delay for visual feedback of loading state before navigation
    setTimeout(() => {
      navigate(route)
    }, 300)
  }

  const renderButton = (
    label: string,
    icon: React.ElementType,
    route: string,
  ) => {
    const Icon = icon
    const isLoading = loadingRoute === route
    return (
      <Button
        variant="outline"
        className="w-full h-auto min-h-[4rem] flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 p-4 whitespace-normal text-center sm:text-left transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/30"
        onClick={() => handleNavigation(route)}
        disabled={loadingRoute !== null}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin shrink-0" />
        ) : (
          <Icon className="h-6 w-6 shrink-0 text-primary/80" />
        )}
        <span className="font-semibold text-sm sm:text-base leading-tight">
          {label}
        </span>
      </Button>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Painel da Alta Gestão
        </h1>
        <p className="text-muted-foreground">
          Visão consolidada e acesso rápido aos módulos estratégicos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Educação e Treinamentos Card */}
        <Card className="flex flex-col border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-primary/5 pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Educação e Treinamentos
            </CardTitle>
            <CardDescription>
              Gerencie e acesse os módulos de capacitação
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-6 space-y-4">
            {renderButton('Acessar treinamentos', GraduationCap, '/trainings')}
            {renderButton('Portal de Cursos', BookOpen, '/trainings')}
            {renderButton('Capacitação', Presentation, '/trainings')}
          </CardContent>
        </Card>

        {/* Riscos e Compliance Card */}
        <Card className="flex flex-col border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-amber-500/5 pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Riscos e Compliance
            </CardTitle>
            <CardDescription>
              Acompanhamento de denúncias e due diligence
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-6 space-y-4">
            {renderButton(
              'Painel de Denúncias',
              ShieldAlert,
              '/senior/pending-reports',
            )}
            {renderButton('Due Diligence', Users, '/senior/due-diligence')}
            {renderButton('Auditorias', BarChart3, '/senior/audit-logs')}
          </CardContent>
        </Card>

        {/* Estratégia e Dados Card */}
        <Card className="flex flex-col border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-blue-500/5 pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Estratégia e Dados
            </CardTitle>
            <CardDescription>
              Métricas e relatórios consolidados
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-6 space-y-4">
            {renderButton(
              'Dados Consolidados',
              BarChart3,
              '/senior/consolidated',
            )}
            {renderButton('Relatórios IA', Presentation, '/senior/ai-reports')}
            {renderButton(
              'Gestão de Escolas',
              LayoutDashboard,
              '/senior/schools',
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
