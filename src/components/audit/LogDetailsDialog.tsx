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
import { Badge } from '@/components/ui/badge'
import { LogEntry } from '@/services/auditService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LogDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: LogEntry | null
  userName?: string
}

export function LogDetailsDialog({
  open,
  onOpenChange,
  log,
  userName,
}: LogDetailsDialogProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Log</DialogTitle>
          <DialogDescription>ID: {log.id}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Data/Hora</Label>
              <div className="font-medium">
                {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", {
                  locale: ptBR,
                })}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Usuário</Label>
              <div className="font-medium">
                {userName || 'Sistema / Desconhecido'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Ação</Label>
              <div>
                <Badge variant="outline">{log.action_type}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Alvo (Tabela)</Label>
              <div className="font-mono text-sm">
                {log.table_affected || 'N/A'}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Descrição</Label>
            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
              {log.description}
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Metadados (JSON)</Label>
            <div className="mt-1 p-3 bg-slate-950 text-slate-50 rounded-md text-xs font-mono overflow-auto max-h-[200px]">
              {log.metadata ? (
                <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
              ) : (
                <span className="text-slate-400">Sem metadados</span>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
