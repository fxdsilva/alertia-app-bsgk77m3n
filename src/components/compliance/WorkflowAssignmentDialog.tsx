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
import { Label } from '@/components/ui/label'
import { UserCheck, AlertTriangle, Scale, Gavel, Users } from 'lucide-react'
import { toast } from 'sonner'
import { complianceService } from '@/services/complianceService'
import { workflowService, WorkflowComplaint } from '@/services/workflowService'
import { SchoolUser } from '@/services/schoolAdminService'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase/client'

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
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>([])
  const [initialAnalysts, setInitialAnalysts] = useState<string[]>([])
  const [resolutionType, setResolutionType] = useState<
    'mediacao' | 'disciplinar'
  >('mediacao')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && complaint) {
      loadAnalysts()
      loadExistingAssignments()
    } else {
      setSelectedAnalysts([])
      setInitialAnalysts([])
      setResolutionType('mediacao')
    }
  }, [open, complaint])

  const loadExistingAssignments = async () => {
    if (!complaint) return
    const existing: string[] = []

    // 1. Load primary analyst from the denúncia row
    if (phase === 1 && complaint.analista_1_id)
      existing.push(complaint.analista_1_id)
    if (phase === 2 && complaint.analista_2_id)
      existing.push(complaint.analista_2_id)
    if (phase === 3 && complaint.analista_3_id)
      existing.push(complaint.analista_3_id)

    // 2. Load extra analysts from workflow_analistas table
    try {
      const { data } = await supabase
        .from('workflow_analistas')
        .select('analista_id')
        .eq('denuncia_id', complaint.id)
        .eq('fase', phase)

      if (data) {
        data.forEach((d) => existing.push(d.analista_id))
      }
    } catch (e) {
      console.error('Failed to load extra analysts', e)
    }

    const unique = Array.from(new Set(existing))
    setSelectedAnalysts(unique)
    setInitialAnalysts(unique)
  }

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
    if (selectedAnalysts.length === 0) {
      toast.error('Selecione pelo menos um analista antes de continuar')
      return
    }
    if (!complaint) return

    setSubmitting(true)
    try {
      const primaryAnalyst = selectedAnalysts[0]
      const currentPrimary =
        phase === 1
          ? complaint.analista_1_id
          : phase === 2
            ? complaint.analista_2_id
            : complaint.analista_3_id

      // Assign the first selected analyst as the primary one via the service to maintain existing logic
      if (primaryAnalyst !== currentPrimary || !currentPrimary) {
        await workflowService.assignAnalyst(
          complaint.id,
          phase,
          primaryAnalyst,
          phase === 3 ? resolutionType : undefined,
        )
      }

      // Re-create the secondary analysts mapping
      await supabase
        .from('workflow_analistas')
        .delete()
        .eq('denuncia_id', complaint.id)
        .eq('fase', phase)

      if (selectedAnalysts.length > 1) {
        const toInsert = selectedAnalysts.slice(1).map((id) => ({
          denuncia_id: complaint.id,
          analista_id: id,
          fase: phase,
        }))
        await supabase.from('workflow_analistas').insert(toInsert)

        // Notify new extra analysts
        const newAnalysts = selectedAnalysts.filter(
          (id) => !initialAnalysts.includes(id),
        )
        const newSecondary = selectedAnalysts
          .slice(1)
          .filter((id) => newAnalysts.includes(id))

        if (newSecondary.length > 0) {
          const notifs = newSecondary.map((id) => ({
            user_id: id,
            title: 'Nova Designação',
            message: `Você foi designado como co-analista na denúncia ${
              complaint.protocolo || ''
            } (Fase ${phase}).`,
            link: `/compliance/analyst/workflow/${complaint.id}`,
            type: 'info',
          }))
          await supabase.from('notifications').insert(notifs)
        }
      }

      toast.success(`Equipe de analistas designada com sucesso`)
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
    if (phase === 1) return 'Equipe de Análise 1 (Procedência)'
    if (phase === 2) return 'Equipe de Análise 2 (Investigação)'
    if (phase === 3) return 'Equipe de Análise 3 (Execução)'
  }

  const getDescription = () => {
    if (phase === 1) return 'Responsáveis pela análise inicial de procedência.'
    if (phase === 2)
      return 'Responsáveis pela investigação aprofundada. (SoD: Analistas da Fase 1 bloqueados)'
    if (phase === 3)
      return 'Responsáveis pela execução da medida. (SoD: Analistas das Fases 1 e 2 bloqueados)'
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
            <Label>Analistas Elegíveis (SoD Validado)</Label>
            <ScrollArea className="h-[200px] w-full border rounded-md p-4 bg-white">
              {loading ? (
                <div className="text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : analysts.length === 0 ? (
                <div className="text-sm text-red-500">
                  Nenhum analista elegível disponível devido às regras de
                  Segregação de Funções (SoD).
                </div>
              ) : (
                <div className="space-y-3">
                  {analysts.map((a) => (
                    <div key={a.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`analyst-${a.id}`}
                        checked={selectedAnalysts.includes(a.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAnalysts([...selectedAnalysts, a.id])
                          } else {
                            setSelectedAnalysts(
                              selectedAnalysts.filter((id) => id !== a.id),
                            )
                          }
                        }}
                      />
                      <Label
                        htmlFor={`analyst-${a.id}`}
                        className="cursor-pointer font-normal flex-1 text-sm"
                      >
                        {a.nome_usuario}
                      </Label>
                      {selectedAnalysts[0] === a.id && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Líder
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-1">
              O primeiro analista selecionado será o líder da fase. Em caso de
              divergência de pareceres, o voto do líder terá poder de decisão
              final.
            </p>
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
              O sistema aplica filtros automáticos para garantir a independência
              entre as fases do processo (Segregação de Funções).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              selectedAnalysts.length === 0 ||
              submitting ||
              analysts.length === 0
            }
            className="gap-2"
          >
            {submitting ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            Confirmar Equipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
