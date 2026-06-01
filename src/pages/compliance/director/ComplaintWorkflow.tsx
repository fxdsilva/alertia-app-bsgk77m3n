import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileSearch,
  ArrowRight,
  Scale,
  CircleCheck,
  ChevronDown,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function ComplaintWorkflow() {
  const [denuncias, setDenuncias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState('f1')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDenuncias()
  }, [])

  const fetchDenuncias = async () => {
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select(
          `
          id,
          protocolo,
          descricao,
          created_at,
          status,
          gravidade,
          status_denuncia(nome_status)
        `,
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      setDenuncias(data || [])
    } catch (error) {
      console.error('Error fetching denuncias:', error)
    } finally {
      setLoading(false)
    }
  }

  const phasesData = useMemo(() => {
    // Classification logic for phases based on common statuses
    const f1 = denuncias.filter(
      (d) =>
        ![
          'em_investigacao',
          'em_execucao',
          'concluido',
          'arquivado',
          'resolvido',
        ].includes(d.status),
    )
    const f2 = denuncias.filter((d) => d.status === 'em_investigacao')
    const f3 = denuncias.filter((d) => d.status === 'em_execucao')
    const encerradas = denuncias.filter((d) =>
      ['concluido', 'arquivado', 'resolvido'].includes(d.status),
    )

    return { f1, f2, f3, encerradas }
  }, [denuncias])

  const phases = [
    {
      id: 'f1',
      name: 'Entrada & Análise',
      icon: FileSearch,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderColor: 'border-indigo-600 dark:border-indigo-400',
      hover:
        'hover:bg-indigo-100 focus:bg-indigo-100 dark:hover:bg-indigo-900/50 dark:focus:bg-indigo-900/50',
      activeBg: 'bg-indigo-100 dark:bg-indigo-900/50',
      count: phasesData.f1.length,
      data: phasesData.f1,
    },
    {
      id: 'f2',
      name: 'Investigação (F2)',
      icon: ArrowRight,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-600 dark:border-blue-400',
      hover:
        'hover:bg-blue-100 focus:bg-blue-100 dark:hover:bg-blue-900/50 dark:focus:bg-blue-900/50',
      activeBg: 'bg-blue-100 dark:bg-blue-900/50',
      count: phasesData.f2.length,
      data: phasesData.f2,
    },
    {
      id: 'f3',
      name: 'Execução (F3)',
      icon: Scale,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-600 dark:border-orange-400',
      hover:
        'hover:bg-orange-100 focus:bg-orange-100 dark:hover:bg-orange-900/50 dark:focus:bg-orange-900/50',
      activeBg: 'bg-orange-100 dark:bg-orange-900/50',
      count: phasesData.f3.length,
      data: phasesData.f3,
    },
    {
      id: 'encerradas',
      name: 'Encerradas',
      icon: CircleCheck,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-600 dark:border-green-400',
      hover:
        'hover:bg-green-100 focus:bg-green-100 dark:hover:bg-green-900/50 dark:focus:bg-green-900/50',
      activeBg: 'bg-green-100 dark:bg-green-900/50',
      count: phasesData.encerradas.length,
      data: phasesData.encerradas,
    },
  ]

  const activePhaseData = phases.find((p) => p.id === activePhase) || phases[0]
  const ActiveIcon = activePhaseData.icon

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workflow de Denúncias
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe as fases do processo.
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-12 px-4 flex items-center gap-3 border-2 transition-all',
                activePhaseData.bg,
                activePhaseData.color,
                'border-transparent hover:border-current/20',
              )}
            >
              <ActiveIcon className="w-5 h-5" />
              <span className="font-semibold text-base">
                {activePhaseData.name}
              </span>
              <Badge
                variant="secondary"
                className="ml-1 px-2 py-0.5 rounded-full bg-background/50 border-none shadow-sm text-current"
              >
                {activePhaseData.count}
              </Badge>
              <ChevronDown className="w-4 h-4 opacity-50 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[300px] p-2 space-y-1 rounded-xl"
          >
            {phases.map((phase) => {
              const Icon = phase.icon
              const isActive = phase.id === activePhase
              return (
                <DropdownMenuItem
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors w-full outline-none',
                    phase.color,
                    isActive ? phase.activeBg : 'bg-transparent',
                    phase.hover,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-[15px]">
                      {phase.name}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 rounded-full bg-background/50 border-none shadow-sm text-xs text-current"
                  >
                    {phase.count}
                  </Badge>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-full">Carregando...</p>
        ) : activePhaseData.data.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-muted/10">
            <ActiveIcon
              className={cn('w-12 h-12 mb-4 opacity-20', activePhaseData.color)}
            />
            <p className="text-muted-foreground font-medium text-lg">
              Nenhuma denúncia nesta fase
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              As denúncias aparecerão aqui quando forem movidas para a fase de{' '}
              {activePhaseData.name}.
            </p>
          </div>
        ) : (
          activePhaseData.data.map((denuncia) => (
            <Card
              key={denuncia.id}
              className={cn(
                'hover:shadow-md transition-shadow cursor-pointer border-l-4 relative overflow-hidden',
                activePhaseData.borderColor,
              )}
              onClick={() =>
                navigate(`/compliance/director/workflow/${denuncia.id}`)
              }
            >
              <div
                className={cn(
                  'absolute inset-0 opacity-0 hover:opacity-[0.02] transition-opacity',
                  activePhaseData.bg,
                )}
              />
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="font-mono bg-background">
                    {denuncia.protocolo}
                  </Badge>
                  <Badge
                    variant={
                      denuncia.gravidade === 'Alta'
                        ? 'destructive'
                        : denuncia.gravidade === 'Média'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {denuncia.gravidade || 'Baixa'}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-3 line-clamp-2 leading-relaxed">
                  {denuncia.descricao}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mr-2 opacity-70" />
                  Status:{' '}
                  {denuncia.status_denuncia?.nome_status || denuncia.status}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 text-xs text-muted-foreground relative z-10">
                <Calendar className="w-4 h-4 mr-2 opacity-70" />
                {new Date(denuncia.created_at).toLocaleDateString('pt-BR')}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
