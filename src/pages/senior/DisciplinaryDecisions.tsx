import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, Search, ShieldAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface Processo {
  id: string
  titulo: string
  descricao: string | null
  data_abertura: string | null
  decisao: string | null
  status_processo_disciplinar: {
    nome_status: string
  } | null
  escolas_instituicoes: {
    nome_escola: string
  } | null
}

export default function DisciplinaryDecisions() {
  const [processos, setProcessos] = useState<Processo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProcessos()
  }, [])

  const fetchProcessos = async () => {
    try {
      const { data, error } = await supabase
        .from('processos_disciplinares')
        .select(
          `
          id,
          titulo,
          descricao,
          data_abertura,
          decisao,
          status_processo_disciplinar (
            nome_status
          ),
          escolas_instituicoes (
            nome_escola
          )
        `,
        )
        .order('data_abertura', { ascending: false })

      if (error) throw error
      setProcessos(data as any)
    } catch (error) {
      console.error('Error fetching processos_disciplinares:', error)
      toast.error('Erro ao carregar processos disciplinares')
    } finally {
      setLoading(false)
    }
  }

  const filtered = processos.filter(
    (p) =>
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.escolas_instituicoes?.nome_escola
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Decisões Disciplinares
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento e gestão de todos os processos disciplinares da rede.
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Processos em Andamento
          </CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou escola..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/30 rounded-xl border border-dashed border-border">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">
                Nenhum processo disciplinar encontrado
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Não existem registros que correspondam à sua busca ou não há
                dados disponíveis.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden bg-background">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-muted/50 border-border">
                    <TableHead className="font-semibold">Processo</TableHead>
                    <TableHead className="font-semibold">
                      Escola / Instituição
                    </TableHead>
                    <TableHead className="font-semibold">
                      Data de Abertura
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Decisão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((proc) => (
                    <TableRow
                      key={proc.id}
                      className="hover:bg-muted/50 transition-colors border-border"
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {proc.titulo}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5 max-w-[300px]">
                          {proc.descricao || 'Sem descrição'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {proc.escolas_instituicoes?.nome_escola || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {proc.data_abertura
                          ? format(new Date(proc.data_abertura), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-medium px-2.5 py-0.5 rounded-full capitalize border-border"
                        >
                          {proc.status_processo_disciplinar?.nome_status ||
                            'Desconhecido'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {proc.decisao || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
