import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { workflowService, WorkflowComplaint } from '@/services/workflowService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Search,
  FileSearch,
  ArrowRight,
  Scale,
  CheckCircle2,
  Calendar,
  Building2,
  Inbox,
  FolderOpen,
  Filter,
  Trash2,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

export default function NetworkWorkflow() {
  const navigate = useNavigate()
  const { profile } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
    f1: any[]
    f2: any[]
    f3: any[]
    closed: any[]
  }>({ f1: [], f2: [], f3: [], closed: [] })
  const [activeTab, setActiveTab] = useState('f1')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (profile === 'senior') {
      fetchData()
    } else {
      navigate('/')
    }
  }, [profile, navigate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await workflowService.getWorkflowDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const currentTabData = useMemo(() => {
    const data = dashboardData[activeTab as keyof typeof dashboardData] || []
    return data.filter((c: any) => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        c.protocolo?.toLowerCase().includes(s) ||
        c.descricao?.toLowerCase().includes(s) ||
        c.escolas_instituicoes?.nome_escola?.toLowerCase().includes(s)
      )
    })
  }, [dashboardData, activeTab, search])

  const counts = useMemo(() => {
    const filterBySearch = (data: any[]) =>
      data.filter((c) => {
        if (!search) return true
        const s = search.toLowerCase()
        return (
          c.protocolo?.toLowerCase().includes(s) ||
          c.descricao?.toLowerCase().includes(s) ||
          c.escolas_instituicoes?.nome_escola?.toLowerCase().includes(s)
        )
      }).length

    return {
      f1: filterBySearch(dashboardData.f1),
      f2: filterBySearch(dashboardData.f2),
      f3: filterBySearch(dashboardData.f3),
      closed: filterBySearch(dashboardData.closed),
    }
  }, [dashboardData, search])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setDeletingId(id)
      await workflowService.deleteComplaint(id)
      toast({
        title: 'Sucesso',
        description: 'Denúncia excluída permanentemente.',
      })
      await fetchData()
    } catch (error: any) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Acesso negado',
        description:
          error?.message ||
          'Você não tem permissão para excluir esta denúncia.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const renderCard = (c: any) => {
    return (
      <Card
        key={c.id}
        className="hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-500 cursor-pointer group relative"
        onClick={() => navigate(`/senior/workflow/${c.id}`)}
      >
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground group-hover:text-indigo-600 transition-colors">
                  {c.protocolo}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(c.created_at), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <h3 className="font-medium text-base line-clamp-1 text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {c.escolas_instituicoes?.nome_escola ||
                  'Escola não identificada'}
              </h3>
            </div>
            {c.gravidade && (
              <Badge
                variant="outline"
                className={cn('capitalize', {
                  'bg-red-50 text-red-700 border-red-200': [
                    'alta',
                    'crítica',
                  ].includes(c.gravidade.toLowerCase()),
                  'bg-yellow-50 text-yellow-700 border-yellow-200':
                    c.gravidade.toLowerCase() === 'média',
                  'bg-green-50 text-green-700 border-green-200':
                    c.gravidade.toLowerCase() === 'baixa',
                })}
              >
                {c.gravidade}
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
            {c.descricao}
          </p>
        </CardContent>
        <CardFooter className="bg-slate-50/50 p-3 px-5 flex justify-between items-center border-t gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-1 min-w-0">
            <div
              className={cn('h-2 w-2 rounded-full shrink-0', {
                'bg-indigo-500': c._phase === 'f1',
                'bg-blue-500': c._phase === 'f2',
                'bg-orange-500': c._phase === 'f3',
                'bg-green-500': c._phase === 'closed',
              })}
            />
            <span className="truncate max-w-[200px]" title={c.status}>
              {c.status}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 z-10"
                  onClick={(e) => e.stopPropagation()}
                  disabled={deletingId === c.id}
                >
                  {deletingId === c.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir denúncia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a denúncia protocolo{' '}
                    <strong>{c.protocolo}</strong>? Esta ação removerá
                    permanentemente todos os dados vinculados e não poderá ser
                    desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={(e) =>
                      handleDelete(c.id, e as unknown as React.MouseEvent)
                    }
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 z-10"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/senior/workflow/${c.id}`)
              }}
            >
              Detalhes <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in bg-slate-50 rounded-lg border border-dashed">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        {search ? (
          <Filter className="h-10 w-10 text-muted-foreground/50" />
        ) : activeTab === 'f1' ? (
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
        ) : (
          <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        {search ? 'Nenhum resultado encontrado' : 'Nenhuma denúncia nesta fase'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1">
        {search
          ? 'Tente ajustar os termos da busca.'
          : 'As denúncias aparecerão aqui conforme o avanço do workflow de rede.'}
      </p>
    </div>
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-20 min-h-screen bg-slate-50/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Workflow de Rede (Admin Master)
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada e controle de todas as denúncias da rede.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por protocolo, escola ou conteúdo..."
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white p-1 border rounded-lg h-auto grid grid-cols-2 md:grid-cols-4 gap-1 w-full shadow-sm">
          <TabsTrigger
            value="f1"
            className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 border border-transparent py-2.5"
          >
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              <span className="hidden md:inline">Entrada (F1)</span>
              <span className="md:hidden">F1</span>
              <Badge
                variant="secondary"
                className="ml-1 bg-slate-100 text-slate-600 group-data-[state=active]:bg-indigo-100 group-data-[state=active]:text-indigo-700"
              >
                {counts.f1}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="f2"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent py-2.5"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              <span className="hidden md:inline">Investigação (F2)</span>
              <span className="md:hidden">F2</span>
              <Badge
                variant="secondary"
                className="ml-1 bg-slate-100 text-slate-600 group-data-[state=active]:bg-blue-100 group-data-[state=active]:text-blue-700"
              >
                {counts.f2}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="f3"
            className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 border border-transparent py-2.5"
          >
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden md:inline">Execução (F3)</span>
              <span className="md:hidden">F3</span>
              <Badge
                variant="secondary"
                className="ml-1 bg-slate-100 text-slate-600 group-data-[state=active]:bg-orange-100 group-data-[state=active]:text-orange-700"
              >
                {counts.f3}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="closed"
            className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border border-transparent py-2.5"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden md:inline">Encerradas</span>
              <span className="md:hidden">Fim</span>
              <Badge
                variant="secondary"
                className="ml-1 bg-slate-100 text-slate-600 group-data-[state=active]:bg-green-100 group-data-[state=active]:text-green-700"
              >
                {counts.closed}
              </Badge>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="f1"
          className="space-y-4 focus-visible:outline-none"
        >
          {currentTabData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentTabData.map(renderCard)}
            </div>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>

        <TabsContent
          value="f2"
          className="space-y-4 focus-visible:outline-none"
        >
          {currentTabData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentTabData.map(renderCard)}
            </div>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>

        <TabsContent
          value="f3"
          className="space-y-4 focus-visible:outline-none"
        >
          {currentTabData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentTabData.map(renderCard)}
            </div>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>

        <TabsContent
          value="closed"
          className="space-y-4 focus-visible:outline-none"
        >
          {currentTabData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentTabData.map(renderCard)}
            </div>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
