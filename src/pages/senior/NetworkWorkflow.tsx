import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { workflowService } from '@/services/workflowService'
import useAppStore from '@/stores/useAppStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  SearchCheck,
  Gavel,
  FileCheck,
  Filter,
  ShieldAlert,
  Inbox,
  Activity,
  CheckCircle2,
  History,
  AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface Investigation {
  id: string
  escola_id: string
  status: string
  data_inicio: string
  created_at: string
  resultado?: string
  escolas_instituicoes?: { nome_escola: string }
  denuncias?: { protocolo: string }
  type: 'investigation'
}

interface DueDiligence {
  id: string
  escola_id: string
  fornecedor: string
  status: string
  nivel_risco: string
  data_analise: string
  created_at: string
  escolas_instituicoes?: { nome_escola: string }
  type: 'due_diligence'
}

interface DisciplinaryProcess {
  id: string
  titulo: string
  status: string
  data_abertura: string
  created_at: string
  escolas_instituicoes?: { nome_escola: string }
}

export default function NetworkWorkflow() {
  const { profile } = useAppStore()
  const isAllowed = [
    'senior',
    'administrador',
    'admin_gestor',
    'DIRETOR_COMPLIANCE',
  ].includes(profile || '')

  const [loading, setLoading] = useState(true)
  const [workflowData, setWorkflowData] = useState({
    f1: [] as any[],
    f2: [] as any[],
    f3: [] as any[],
    closed: [] as any[],
  })
  const [activeItems, setActiveItems] = useState<
    (Investigation | DueDiligence)[]
  >([])
  const [processes, setProcesses] = useState<DisciplinaryProcess[]>([])
  const [selectedPhase, setSelectedPhase] = useState<
    'all' | 'f1' | 'f2' | 'f3' | 'closed'
  >('all')

  useEffect(() => {
    if (isAllowed) fetchData()
  }, [isAllowed])

  const fetchData = async () => {
    setLoading(true)
    try {
      const wfData = await workflowService.getWorkflowDashboardData()
      setWorkflowData(wfData)

      const [{ data: invData }, { data: ddData }, { data: procData }] =
        await Promise.all([
          supabase
            .from('investigacoes')
            .select(
              '*, escolas_instituicoes(nome_escola), denuncias(protocolo)',
            )
            .neq('status', 'concluida')
            .order('data_inicio', { ascending: false })
            .limit(5),
          supabase
            .from('due_diligence')
            .select('*, escolas_instituicoes(nome_escola)')
            .neq('status', 'Concluído')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('processos_disciplinares')
            .select('*, escolas_instituicoes(nome_escola)')
            .order('data_abertura', { ascending: false })
            .limit(5),
        ])

      const mergedActive: (Investigation | DueDiligence)[] = [
        ...(invData?.map((i) => ({ ...i, type: 'investigation' as const })) ||
          []),
        ...(ddData?.map((d) => ({ ...d, type: 'due_diligence' as const })) ||
          []),
      ]
        .sort((a, b) => {
          const dateA = new Date(
            a.type === 'investigation'
              ? a.data_inicio || a.created_at
              : a.data_analise || a.created_at,
          ).getTime()
          const dateB = new Date(
            b.type === 'investigation'
              ? b.data_inicio || b.created_at
              : b.data_analise || b.created_at,
          ).getTime()
          return dateB - dateA
        })
        .slice(0, 8)

      setActiveItems(mergedActive)
      if (procData) setProcesses(procData as any)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para visualizar este dashboard.
          </p>
        </div>
      </div>
    )
  }

  const metrics = [
    {
      id: 'f1',
      label: 'Entrada (F1)',
      count: workflowData.f1.length,
      icon: Inbox,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      id: 'f2',
      label: 'Investigação (F2)',
      count: workflowData.f2.length,
      icon: SearchCheck,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      id: 'f3',
      label: 'Execução (F3)',
      count: workflowData.f3.length,
      icon: Activity,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      id: 'closed',
      label: 'Encerradas',
      count: workflowData.closed.length,
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ]

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'f1':
        return 'Entrada (F1)'
      case 'f2':
        return 'Investigação (F2)'
      case 'f3':
        return 'Execução (F3)'
      case 'closed':
        return 'Encerradas'
      default:
        return 'Todas as Fases'
    }
  }

  const complaintsList =
    selectedPhase === 'all'
      ? [
          ...workflowData.f1,
          ...workflowData.f2,
          ...workflowData.f3,
          ...workflowData.closed,
        ]
      : workflowData[selectedPhase]

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workflow de Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as fases de denúncias e processos investigativos.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {getPhaseLabel(selectedPhase)}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setSelectedPhase('all')}>
              Todas as Fases
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPhase('f1')}>
              Entrada (F1)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPhase('f2')}>
              Investigação (F2)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPhase('f3')}>
              Execução (F3)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPhase('closed')}>
              Encerradas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((m) => (
          <Card
            key={m.id}
            className={cn(
              'transition-colors duration-200 cursor-pointer',
              selectedPhase === m.id
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50',
            )}
            onClick={() => setSelectedPhase(m.id as any)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{m.label}</CardTitle>
              <div className={cn('p-2 rounded-lg', m.bg)}>
                <m.icon className={cn('h-4 w-4', m.color)} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{m.count}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchCheck className="h-5 w-5 text-primary" />
              Investigações em Andamento
            </CardTitle>
            <CardDescription>
              Acompanhe o status e nível de risco das due diligences ativas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activeItems.length > 0 ? (
              <div className="space-y-4">
                {activeItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-secondary/20 transition-colors hover:bg-secondary/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            item.type === 'due_diligence'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }
                        >
                          {item.type === 'due_diligence'
                            ? 'Due Diligence'
                            : 'Investigação'}
                        </Badge>
                        <span className="font-medium">
                          {item.type === 'due_diligence'
                            ? item.fornecedor
                            : `Ref: ${item.denuncias?.protocolo || 'N/A'}`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.escolas_instituicoes?.nome_escola ||
                          'Instituição não informada'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{item.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.type === 'investigation'
                          ? item.data_inicio
                            ? format(
                                new Date(item.data_inicio),
                                "dd 'de' MMM, yyyy",
                                { locale: ptBR },
                              )
                            : '-'
                          : item.data_analise
                            ? format(
                                new Date(item.data_analise),
                                "dd 'de' MMM, yyyy",
                                { locale: ptBR },
                              )
                            : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4 rounded-xl border border-dashed border-border bg-secondary/10">
                <AlertTriangle className="h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhum registro encontrado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico de Sanções e Processos
            </CardTitle>
            <CardDescription>
              Lista completa de processos disciplinares para análise de
              conformidade e integridade institucional.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : processes.length > 0 ? (
              <div className="space-y-4">
                {processes.map((proc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-secondary/20 transition-colors hover:bg-secondary/40"
                  >
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-muted-foreground" />
                        {proc.titulo}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {proc.escolas_instituicoes?.nome_escola ||
                          'Instituição não informada'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{proc.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {proc.data_abertura
                          ? format(
                              parseISO(proc.data_abertura),
                              "dd 'de' MMM, yyyy",
                              { locale: ptBR },
                            )
                          : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4 rounded-xl border border-dashed border-border bg-secondary/10">
                <Gavel className="h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhum processo disciplinar registrado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Listagem de Denúncias - {getPhaseLabel(selectedPhase)}
          </CardTitle>
          <CardDescription>
            Acompanhe os detalhes das denúncias no fluxo selecionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : complaintsList.length > 0 ? (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-secondary/50">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Protocolo
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Escola/Instituição
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Fase
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {complaintsList.map((complaint) => (
                      <tr
                        key={complaint.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">
                          {complaint.protocolo}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {complaint.escolas_instituicoes?.nome_escola || '-'}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant="outline"
                            className={
                              complaint._phase === 'f1'
                                ? 'bg-blue-50 text-blue-700'
                                : complaint._phase === 'f2'
                                  ? 'bg-amber-50 text-amber-700'
                                  : complaint._phase === 'f3'
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'bg-green-50 text-green-700'
                            }
                          >
                            {complaint.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground uppercase text-xs font-bold tracking-wider">
                          {complaint._phase}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/senior/workflow/${complaint.id}`}>
                              Detalhes
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-secondary/10">
              <FileCheck className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-medium">
                Nenhuma denúncia encontrada nesta fase.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
