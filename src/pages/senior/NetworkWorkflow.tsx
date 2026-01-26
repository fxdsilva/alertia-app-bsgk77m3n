import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  workflowService,
  WorkflowComplaint,
  WORKFLOW_STATUS,
} from '@/services/workflowService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'
import { Loader2 } from 'lucide-react'

export default function NetworkWorkflow() {
  const navigate = useNavigate()
  const { profile } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState<WorkflowComplaint[]>([])
  const [activeTab, setActiveTab] = useState('f1')
  const [search, setSearch] = useState('')

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
      const data = await workflowService.getComplaintsByStatus(
        Object.values(WORKFLOW_STATUS),
      )
      setComplaints(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const phases = useMemo(
    () => ({
      f1: [
        WORKFLOW_STATUS.REGISTERED,
        WORKFLOW_STATUS.WAITING_ANALYST_1,
        WORKFLOW_STATUS.ANALYSIS_1,
        WORKFLOW_STATUS.REVIEW_1,
        WORKFLOW_STATUS.RETURNED_1,
      ],
      f2: [
        WORKFLOW_STATUS.APPROVED_PROCEDURE,
        WORKFLOW_STATUS.INVESTIGATION_2,
        WORKFLOW_STATUS.REVIEW_2,
      ],
      f3: [
        WORKFLOW_STATUS.WAITING_ANALYST_3,
        WORKFLOW_STATUS.MEDIATION_3,
        WORKFLOW_STATUS.DISCIPLINARY_3,
        WORKFLOW_STATUS.REVIEW_3,
      ],
      closed: [WORKFLOW_STATUS.CLOSED, WORKFLOW_STATUS.ARCHIVED],
    }),
    [],
  )

  const filteredData = useMemo(() => {
    return complaints.filter((c) => {
      const searchMatch =
        !search ||
        c.protocolo.toLowerCase().includes(search.toLowerCase()) ||
        c.descricao.toLowerCase().includes(search.toLowerCase()) ||
        c.escolas_instituicoes?.nome_escola
          .toLowerCase()
          .includes(search.toLowerCase())

      return searchMatch
    })
  }, [complaints, search])

  const currentTabData = useMemo(() => {
    const currentStatuses = phases[activeTab as keyof typeof phases] || []
    return filteredData.filter((c) => currentStatuses.includes(c.status))
  }, [filteredData, activeTab, phases])

  const counts = useMemo(() => {
    return {
      f1: filteredData.filter((c) => phases.f1.includes(c.status)).length,
      f2: filteredData.filter((c) => phases.f2.includes(c.status)).length,
      f3: filteredData.filter((c) => phases.f3.includes(c.status)).length,
      closed: filteredData.filter((c) => phases.closed.includes(c.status))
        .length,
    }
  }, [filteredData, phases])

  const renderCard = (c: WorkflowComplaint) => {
    return (
      <Card
        key={c.id}
        className="hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-500 cursor-pointer group"
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
        <CardFooter className="bg-slate-50/50 p-3 px-5 flex justify-between items-center border-t">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <div
              className={cn('h-2 w-2 rounded-full', {
                'bg-indigo-500': phases.f1.includes(c.status),
                'bg-blue-500': phases.f2.includes(c.status),
                'bg-orange-500': phases.f3.includes(c.status),
                'bg-green-500': phases.closed.includes(c.status),
              })}
            />
            <span className="truncate max-w-[200px]" title={c.status}>
              {c.status}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            Detalhes <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
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
