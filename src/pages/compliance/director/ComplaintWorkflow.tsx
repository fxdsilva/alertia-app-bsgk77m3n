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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Search,
  Filter,
  FileSearch,
  ArrowRight,
  Scale,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FolderOpen,
  UserCheck,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { WorkflowAssignmentDialog } from '@/components/compliance/WorkflowAssignmentDialog'

export default function ComplaintWorkflow() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState<WorkflowComplaint[]>([])
  const [activeTab, setActiveTab] = useState('f1')

  // Filters
  const [search, setSearch] = useState('')
  const [gravityFilter, setGravityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Assignment Dialog State
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] =
    useState<WorkflowComplaint | null>(null)
  const [assignPhase, setAssignPhase] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    fetchData()
  }, [])

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

  // Define Phases
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

  // Filter Data
  const filteredData = useMemo(() => {
    return complaints.filter((c) => {
      // 1. Search Filter
      const searchMatch =
        !search ||
        c.protocolo.toLowerCase().includes(search.toLowerCase()) ||
        c.descricao.toLowerCase().includes(search.toLowerCase())

      // 2. Gravity Filter
      const gravityMatch =
        gravityFilter === 'all' || c.gravidade === gravityFilter

      // 3. Category Filter
      const categoryMatch =
        categoryFilter === 'all' ||
        (c.categoria && c.categoria.includes(categoryFilter))

      return searchMatch && gravityMatch && categoryMatch
    })
  }, [complaints, search, gravityFilter, categoryFilter])

  // Calculate Counts per Phase based on filtered data
  const counts = useMemo(() => {
    return {
      f1: filteredData.filter((c) => phases.f1.includes(c.status)).length,
      f2: filteredData.filter((c) => phases.f2.includes(c.status)).length,
      f3: filteredData.filter((c) => phases.f3.includes(c.status)).length,
      closed: filteredData.filter((c) => phases.closed.includes(c.status))
        .length,
    }
  }, [filteredData, phases])

  // Get current tab data
  const currentTabData = useMemo(() => {
    const currentStatuses = phases[activeTab as keyof typeof phases] || []
    return filteredData.filter((c) => currentStatuses.includes(c.status))
  }, [filteredData, activeTab, phases])

  // Dynamic Categories for Filter
  const availableCategories = useMemo(() => {
    const cats = new Set<string>()
    complaints.forEach((c) => c.categoria?.forEach((cat) => cats.add(cat)))
    return Array.from(cats).sort()
  }, [complaints])

  const handleAssign = (complaint: WorkflowComplaint, phase: 1 | 2 | 3) => {
    setSelectedComplaint(complaint)
    setAssignPhase(phase)
    setAssignOpen(true)
  }

  const handleReview = (id: string) => {
    navigate(`/compliance/director/workflow/${id}`)
  }

  const getGravityBadgeStyle = (gravity?: string | null) => {
    switch (gravity?.toLowerCase()) {
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
      case 'média':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
      case 'crítica':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const renderCard = (c: WorkflowComplaint) => {
    let action = null

    // Determine primary action
    if (
      c.status === WORKFLOW_STATUS.REGISTERED ||
      c.status === WORKFLOW_STATUS.WAITING_ANALYST_1
    ) {
      action = (
        <Button
          size="sm"
          onClick={() => handleAssign(c, 1)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <UserCheck className="h-4 w-4" /> Designar Analista 1
        </Button>
      )
    } else if (c.status === WORKFLOW_STATUS.APPROVED_PROCEDURE) {
      action = (
        <Button
          size="sm"
          onClick={() => handleAssign(c, 2)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <UserCheck className="h-4 w-4" /> Designar Analista 2
        </Button>
      )
    } else if (c.status === WORKFLOW_STATUS.WAITING_ANALYST_3) {
      action = (
        <Button
          size="sm"
          onClick={() => handleAssign(c, 3)}
          className="gap-2 bg-orange-600 hover:bg-orange-700"
        >
          <UserCheck className="h-4 w-4" /> Designar Analista 3
        </Button>
      )
    } else {
      action = (
        <Button size="sm" variant="outline" onClick={() => handleReview(c.id)}>
          Ver Detalhes
        </Button>
      )
    }

    return (
      <Card
        key={c.id}
        className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/40"
      >
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground">
                  {c.protocolo}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(c.created_at), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <h3 className="font-medium text-base line-clamp-1 text-slate-900">
                {c.escolas_instituicoes?.nome_escola ||
                  'Escola não identificada'}
              </h3>
            </div>
            {c.gravidade && (
              <Badge
                variant="outline"
                className={cn('capitalize', getGravityBadgeStyle(c.gravidade))}
              >
                {c.gravidade}
              </Badge>
            )}
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
            {c.descricao}
          </p>

          <div className="flex flex-wrap gap-2">
            {c.categoria?.map((cat, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs font-normal"
              >
                {cat}
              </Badge>
            ))}
            {(!c.categoria || c.categoria.length === 0) && (
              <span className="text-xs text-muted-foreground italic">
                Sem categoria
              </span>
            )}
          </div>
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
            <span className="truncate max-w-[150px]" title={c.status}>
              {c.status}
            </span>
          </div>
          {action}
        </CardFooter>
      </Card>
    )
  }

  const renderEmptyState = (phase: string) => {
    let icon = FolderOpen
    let message = 'Nenhuma denúncia nesta fase.'
    let subMessage =
      'As denúncias aparecerão aqui conforme o avanço do workflow.'

    if (phase === 'f1' && !search) {
      icon = Inbox
      message = 'Tudo limpo por aqui!'
      subMessage = 'Não há novas denúncias para análise de procedência.'
    } else if (search) {
      icon = FileSearch
      message = 'Nenhum resultado encontrado'
      subMessage = 'Tente ajustar os filtros ou a busca.'
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in bg-slate-50 rounded-lg border border-dashed">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          {/* @ts-expect-error */}
          <icon className="h-10 w-10 text-muted-foreground/50" />
          {/* TS ignore used because treating icon component as generic react node sometimes causes issues with specific lucide versions, but here it works */}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{message}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          {subMessage}
        </p>
        {search && (
          <Button
            variant="link"
            onClick={() => {
              setSearch('')
              setGravityFilter('all')
              setCategoryFilter('all')
            }}
            className="mt-4"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-20 min-h-screen bg-slate-50/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Gestão de Workflow
          </h1>
          <p className="text-muted-foreground mt-1">
            Fluxo formal de compliance com segregação de funções.
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por protocolo, descrição ou escola..."
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Select value={gravityFilter} onValueChange={setGravityFilter}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Gravidade" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as gravidades</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Crítica">Crítica</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {availableCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <span className="hidden md:inline">Entrada & Análise</span>
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
            renderEmptyState('f1')
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
            renderEmptyState('f2')
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
            renderEmptyState('f3')
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
            renderEmptyState('closed')
          )}
        </TabsContent>
      </Tabs>

      <WorkflowAssignmentDialog
        key={selectedComplaint?.id ?? 'list'}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        complaint={selectedComplaint}
        phase={assignPhase}
        onSuccess={fetchData}
      />
    </div>
  )
}
