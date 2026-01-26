import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UserCheck, AlertTriangle, Scale, Gavel } from 'lucide-react'
import { toast } from 'sonner'
import { complianceService } from '@/services/complianceService'
import { workflowService, WorkflowComplaint } from '@/services/workflowService'
import { SchoolUser } from '@/services/schoolAdminService'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface WorkflowAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  complaint: WorkflowComplaint | null
  phase: 1 | 2 | 3
  onSuccess: () => void
}

export function WorkflowAssignmentDialog({
  open,
  onOpenChange,
  complaint,
  phase,
  onSuccess,
}: WorkflowAssignmentDialogProps) {
  const [analysts, setAnalysts] = useState<SchoolUser[]>([])
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('')
  const [resolutionType, setResolutionType] = useState<
    'mediacao' | 'disciplinar'
  >('mediacao')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && complaint) {
      loadAnalysts()
    }
  }, [open, complaint])

  const loadAnalysts = async () => {
    setLoading(true)
    try {
      const allAnalysts =
        (await complianceService.getAnalysts()) as SchoolUser[]

      // Strict SoD Filtering
      const filtered = allAnalysts.filter((a) => {
        if (phase === 1) return true
        if (phase === 2) return a.id !== complaint?.analista_1_id
        if (phase === 3)
          return (
            a.id !== complaint?.analista_1_id &&
            a.id !== complaint?.analista_2_id
          )
        return true
      })

      setAnalysts(filtered)
    } catch (error) {
      toast.error('Erro ao carregar analistas')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!complaint || !selectedAnalyst) return
    setSubmitting(true)
    try {
      await workflowService.assignAnalyst(
        complaint.id,
        phase,
        selectedAnalyst,
        phase === 3 ? resolutionType : undefined,
      )
      toast.success(`Analista ${phase} designado com sucesso`)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao realizar designação')
    } finally {
      setSubmitting(false)
    }
  }

  const getTitle = () => {
    if (phase === 1) return 'Designação de Analista 1 (Procedência)'
    if (phase === 2) return 'Designação de Analista 2 (Investigação)'
    if (phase === 3) return 'Designação de Analista 3 (Execução)'
  }

  const getDescription = () => {
    if (phase === 1) return 'Responsável pela análise inicial de procedência.'
    if (phase === 2)
      return 'Responsável pela investigação aprofundada. (SoD: Analista 1 bloqueado)'
    if (phase === 3)
      return 'Responsável pela execução da medida. (SoD: Analista 1 e 2 bloqueados)'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Analista Elegível (SoD Validado)</Label>
            <Select
              value={selectedAnalyst}
              onValueChange={setSelectedAnalyst}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loading ? 'Carregando...' : 'Selecione...'}
                />
              </SelectTrigger>
              <SelectContent>
                {analysts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome_usuario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {analysts.length === 0 && !loading && (
              <p className="text-xs text-red-500">
                Nenhum analista elegível disponível devido às regras de
                Segregação de Funções (SoD).
              </p>
            )}
          </div>

          {phase === 3 && (
            <div className="space-y-3 bg-slate-50 p-3 rounded-lg border">
              <Label>Tipo de Resolução</Label>
              <RadioGroup
                value={resolutionType}
                onValueChange={(v) =>
                  setResolutionType(v as 'mediacao' | 'disciplinar')
                }
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mediacao" id="r1" />
                  <Label
                    htmlFor="r1"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Scale className="h-4 w-4 text-blue-600" /> Mediação de
                    Conflitos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disciplinar" id="r2" />
                  <Label
                    htmlFor="r2"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Gavel className="h-4 w-4 text-red-600" /> Medida
                    Disciplinar
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="bg-yellow-50 p-3 rounded-md text-xs text-yellow-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>
              O sistema aplicou filtros automáticos para garantir a
              independência entre as fases do processo (Segregação de Funções).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedAnalyst || submitting || analysts.length === 0}
            className="gap-2"
          >
            {submitting ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
