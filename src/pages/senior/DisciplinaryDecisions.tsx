import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase/client'
import {
  FileSearch,
  GitBranch,
  Scale,
  CheckCircle2,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function DropdownButton({
  label,
  options,
}: {
  label: string
  options: { label: string; onClick?: () => void }[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-4 h-10 w-full sm:w-auto"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {options.map((opt, i) => (
          <DropdownMenuItem key={i} onClick={opt.onClick}>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function DisciplinaryDecisions() {
  const [activeTab, setActiveTab] = useState('entrada')
  const [dueDiligence, setDueDiligence] = useState<any[]>([])
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'entrada', label: 'Entrada & Análise', icon: FileSearch },
    { id: 'investigacao', label: 'Investigação (F2)', icon: GitBranch },
    { id: 'execucao', label: 'Execução (F3)', icon: Scale },
    { id: 'encerradas', label: 'Encerradas', icon: CheckCircle2 },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ddRes, pdRes] = await Promise.all([
        supabase
          .from('due_diligence')
          .select(
            '*, escolas_instituicoes(nome_escola), status_due_diligence(nome_status)',
          ),
        supabase
          .from('processos_disciplinares')
          .select(
            '*, escolas_instituicoes(nome_escola), status_processo_disciplinar(nome_status)',
          ),
      ])

      if (ddRes.data) setDueDiligence(ddRes.data)
      if (pdRes.data) setProcessos(pdRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getTabCount = (tabId: string) => {
    if (tabId === 'entrada') return dueDiligence.length
    if (tabId === 'investigacao')
      return processos.filter(
        (p) =>
          p.status_processo_disciplinar?.nome_status
            ?.toLowerCase()
            .includes('investiga') || p.status === 'em_andamento',
      ).length
    if (tabId === 'execucao')
      return processos.filter(
        (p) =>
          p.status_processo_disciplinar?.nome_status
            ?.toLowerCase()
            .includes('execu') || p.status === 'execucao',
      ).length
    if (tabId === 'encerradas')
      return processos.filter(
        (p) =>
          p.status_processo_disciplinar?.nome_status
            ?.toLowerCase()
            .includes('conclu') || p.status === 'concluido',
      ).length
    return 0
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Decisões Disciplinares
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os processos e diligências da instituição.
          </p>
        </div>
        <DropdownButton
          label="Ações e Filtros"
          options={[
            { label: 'Todos os Registros' },
            { label: 'Alta Gravidade' },
            { label: 'Mais Recentes' },
          ]}
        />
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max items-center gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const count = getTabCount(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all outline-none ring-0 shrink-0',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent',
                )}
              >
                <tab.icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-indigo-600' : 'text-slate-400',
                  )}
                />
                <span className="truncate">{tab.label}</span>
                {count >= 0 && (
                  <span
                    className={cn(
                      'text-xs rounded-full px-2 py-0.5 ml-1 font-semibold shrink-0',
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg">
                Investigações em Andamento
              </CardTitle>
              <CardDescription>
                Acompanhe o status e nível de risco das due diligences ativas.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {dueDiligence.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  <AlertCircle className="h-8 w-8 text-slate-400 mb-3" />
                  <p className="font-medium text-slate-600">
                    Nenhum registro encontrado.
                  </p>
                  <p className="text-sm mt-1">
                    Não há due diligences ativas no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dueDiligence.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-900 truncate">
                          {item.fornecedor || 'Registro sem nome'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          Escola:{' '}
                          {item.escolas_instituicoes?.nome_escola ||
                            'Não informada'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            item.nivel_risco?.toLowerCase() === 'alto' ||
                            item.nivel_risco?.toLowerCase() === 'critico'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="shrink-0"
                        >
                          {item.nivel_risco || 'Sem risco definido'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-indigo-50 text-indigo-700 border-indigo-200 shrink-0"
                        >
                          {item.status_due_diligence?.nome_status ||
                            item.status ||
                            'Pendente'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-700"
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg">
                Histórico de Sanções e Processos
              </CardTitle>
              <CardDescription>
                Lista completa de processos disciplinares para análise de
                conformidade e integridade institucional.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {processos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  <AlertCircle className="h-8 w-8 text-slate-400 mb-3" />
                  <p className="font-medium text-slate-600">
                    Nenhum processo disciplinar registrado.
                  </p>
                  <p className="text-sm mt-1">
                    O histórico de sanções está vazio.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {processos.map((proc) => (
                    <div
                      key={proc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-900 truncate">
                          {proc.titulo || 'Processo sem título'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          Escola:{' '}
                          {proc.escolas_instituicoes?.nome_escola ||
                            'Não informada'}{' '}
                          • Abertura:{' '}
                          {proc.data_abertura
                            ? new Date(proc.data_abertura).toLocaleDateString(
                                'pt-BR',
                              )
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={cn(
                            'shrink-0',
                            proc.status_processo_disciplinar?.nome_status
                              ?.toLowerCase()
                              .includes('conclu') || proc.status === 'concluido'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200',
                          )}
                        >
                          {proc.status_processo_disciplinar?.nome_status ||
                            proc.status ||
                            'Em andamento'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-700"
                        >
                          Analisar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
