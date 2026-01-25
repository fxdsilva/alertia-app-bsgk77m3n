import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Scale,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  workflowService,
  WorkflowComplaint,
  WORKFLOW_STATUS,
} from '@/services/workflowService'
import { WorkflowAssignmentDialog } from '@/components/compliance/WorkflowAssignmentDialog'

export default function ComplaintWorkflow() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState<WorkflowComplaint[]>([])

  // Assignment State
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

  const handleAssign = (complaint: WorkflowComplaint, phase: 1 | 2 | 3) => {
    setSelectedComplaint(complaint)
    setAssignPhase(phase)
    setAssignOpen(true)
  }

  const handleReview = (id: string) => {
    navigate(`/compliance/director/workflow/${id}`)
  }

  const renderCard = (c: WorkflowComplaint) => {
    let action = null

    // Logic to determine action button
    if (
      c.status === WORKFLOW_STATUS.REGISTERED ||
      c.status === WORKFLOW_STATUS.WAITING_ANALYST_1
    ) {
      action = (
        <Button size="sm" onClick={() => handleAssign(c, 1)}>
          Designar Analista 1
        </Button>
      )
    } else if (
      c.status === WORKFLOW_STATUS.REVIEW_1 ||
      c.status === WORKFLOW_STATUS.REVIEW_2 ||
      c.status === WORKFLOW_STATUS.REVIEW_3
    ) {
      action = (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleReview(c.id)}
        >
          Revisar Parecer
        </Button>
      )
    } else if (c.status === WORKFLOW_STATUS.APPROVED_PROCEDURE) {
      action = (
        <Button size="sm" onClick={() => handleAssign(c, 2)}>
          Designar Analista 2
        </Button>
      )
    } else if (c.status === WORKFLOW_STATUS.WAITING_ANALYST_3) {
      action = (
        <Button size="sm" onClick={() => handleAssign(c, 3)}>
          Designar Analista 3
        </Button>
      )
    }

    return (
      <Card
        key={c.id}
        className="mb-4 hover:border-primary/50 transition-colors"
      >
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold bg-muted px-2 py-0.5 rounded">
                {c.protocolo}
              </span>
              <Badge
                variant="outline"
                className="text-xs truncate max-w-[200px]"
              >
                {c.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {c.escolas_instituicoes?.nome_escola}
            </p>
            <p className="text-sm font-medium line-clamp-1">{c.descricao}</p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {c.analista_1 && (
              <div className="text-xs text-muted-foreground">
                A1: {c.analista_1.nome_usuario}
              </div>
            )}
            {c.analista_2 && (
              <div className="text-xs text-muted-foreground">
                A2: {c.analista_2.nome_usuario}
              </div>
            )}
            {c.analista_3 && (
              <div className="text-xs text-muted-foreground">
                A3: {c.analista_3.nome_usuario}
              </div>
            )}

            {action || (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleReview(c.id)}
              >
                Ver Detalhes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter lists
  const intake = complaints.filter((c) =>
    [WORKFLOW_STATUS.REGISTERED, WORKFLOW_STATUS.WAITING_ANALYST_1].includes(
      c.status,
    ),
  )
  const phase1 = complaints.filter((c) =>
    [
      WORKFLOW_STATUS.ANALYSIS_1,
      WORKFLOW_STATUS.REVIEW_1,
      WORKFLOW_STATUS.RETURNED_1,
    ].includes(c.status),
  )
  const phase2 = complaints.filter((c) =>
    [
      WORKFLOW_STATUS.APPROVED_PROCEDURE,
      WORKFLOW_STATUS.INVESTIGATION_2,
      WORKFLOW_STATUS.REVIEW_2,
    ].includes(c.status),
  )
  const phase3 = complaints.filter((c) =>
    [
      WORKFLOW_STATUS.WAITING_ANALYST_3,
      WORKFLOW_STATUS.MEDIATION_3,
      WORKFLOW_STATUS.DISCIPLINARY_3,
      WORKFLOW_STATUS.REVIEW_3,
    ].includes(c.status),
  )

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestão de Workflow
        </h1>
        <p className="text-muted-foreground">
          Fluxo formal de compliance com segregação de funções.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Phase 1: Intake */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-slate-700 pb-2 border-b-2 border-slate-200">
            <FileSearch className="h-5 w-5" /> Entrada & Análise (F1)
            <Badge variant="secondary" className="ml-auto">
              {intake.length + phase1.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {intake.map(renderCard)}
            {phase1.map(renderCard)}
          </div>
        </div>

        {/* Phase 2: Investigation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-blue-700 pb-2 border-b-2 border-blue-200">
            <ArrowRight className="h-5 w-5" /> Investigação (F2)
            <Badge variant="secondary" className="ml-auto bg-blue-100">
              {phase2.length}
            </Badge>
          </div>
          <div className="space-y-2">{phase2.map(renderCard)}</div>
        </div>

        {/* Phase 3: Execution */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-orange-700 pb-2 border-b-2 border-orange-200">
            <Scale className="h-5 w-5" /> Execução (F3)
            <Badge variant="secondary" className="ml-auto bg-orange-100">
              {phase3.length}
            </Badge>
          </div>
          <div className="space-y-2">{phase3.map(renderCard)}</div>
        </div>

        {/* Closed */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-green-700 pb-2 border-b-2 border-green-200">
            <CheckCircle2 className="h-5 w-5" /> Encerradas
          </div>
          <div className="space-y-2 opacity-70">
            {complaints
              .filter(
                (c) =>
                  c.status === WORKFLOW_STATUS.CLOSED ||
                  c.status === WORKFLOW_STATUS.ARCHIVED,
              )
              .slice(0, 5)
              .map(renderCard)}
          </div>
        </div>
      </div>

      <WorkflowAssignmentDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        complaint={selectedComplaint}
        phase={assignPhase}
        onSuccess={fetchData}
      />
    </div>
  )
}
