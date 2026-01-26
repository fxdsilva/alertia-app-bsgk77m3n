import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Calendar,
  User,
  Building2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { complianceService, AuditFinding } from '@/services/complianceService'
import { Skeleton } from '@/components/ui/skeleton'

interface AuditDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  audit: any
}

export function AuditDetailsSheet({
  open,
  onOpenChange,
  audit,
}: AuditDetailsSheetProps) {
  const [findings, setFindings] = useState<AuditFinding[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && audit?.id) {
      fetchFindings(audit.id)
    }
  }, [open, audit])

  const fetchFindings = async (auditId: string) => {
    setLoading(true)
    try {
      const data = await complianceService.getAuditFindings(auditId)
      setFindings(data)
    } catch (error) {
      console.error('Error fetching findings', error)
    } finally {
      setLoading(false)
    }
  }

  if (!audit) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Detalhes da Auditoria
          </SheetTitle>
          <SheetDescription>
            Informações completas e pendências identificadas.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Data
              </span>
              <p className="font-medium">
                {format(new Date(audit.data_auditoria), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Escola
              </span>
              <p
                className="font-medium text-sm truncate"
                title={audit.escolas_instituicoes?.nome_escola}
              >
                {audit.escolas_instituicoes?.nome_escola || 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase flex items-center gap-1">
                <Info className="h-3 w-3" /> Tipo
              </span>
              <p className="font-medium">{audit.tipo}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase flex items-center gap-1">
                <User className="h-3 w-3" /> Responsável
              </span>
              <p className="font-medium">{audit.responsavel}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Status</h3>
            <Badge
              variant="outline"
              className={
                audit.status_auditoria?.nome_status === 'Concluída'
                  ? 'bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200 text-sm px-3 py-1'
              }
            >
              {audit.status_auditoria?.nome_status || audit.status}
            </Badge>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Pendências e Achados
              </h3>
              <Badge variant="secondary">{findings.length}</Badge>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : findings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-50" />
                  <p>Nenhuma pendência registrada.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-4 rounded-lg border bg-card shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            finding.severity === 'Alta'
                              ? 'bg-red-100 text-red-700'
                              : finding.severity === 'Média'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {finding.status}
                        </span>
                      </div>
                      <p className="font-medium text-sm">
                        {finding.description}
                      </p>
                      {finding.recommendation && (
                        <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground mt-2">
                          <strong>Recomendação:</strong>{' '}
                          {finding.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
