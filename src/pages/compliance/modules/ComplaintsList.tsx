import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComplaints } from '@/hooks/useComplaints'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, Eye, AlertCircle, Paperclip } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ComplaintsList() {
  const { complaints, loading, error } = useComplaints()
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const filteredComplaints = complaints.filter(
    (c) =>
      c.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.descricao &&
        c.descricao.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Denúncias</h1>
          <p className="text-muted-foreground">
            Gerenciamento e análise de denúncias do sistema.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Denúncias</CardTitle>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por protocolo..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" title="Filtros avançados">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/10 rounded-md border border-destructive/20">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <p className="text-destructive font-medium">
                Erro ao carregar denúncias.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {error.message}
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-md bg-muted/20">
              <p className="text-muted-foreground">
                Nenhuma denúncia encontrada.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Protocolo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Gravidade</TableHead>
                    <TableHead>Anexos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow
                      key={complaint.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {complaint.protocolo}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(complaint.created_at), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={complaint.escola_nome}
                      >
                        {complaint.escola_nome || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            complaint.gravidade === 'Alta'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="font-normal"
                        >
                          {complaint.gravidade || 'Baixa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {complaint.attachments &&
                        complaint.attachments.length > 0 ? (
                          <div
                            className="flex items-center text-xs text-muted-foreground"
                            title={`${complaint.attachments.length} anexo(s)`}
                          >
                            <Paperclip className="h-3 w-3 mr-1" />
                            {complaint.attachments.length}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {complaint.status_nome || complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/compliance/complaints/${complaint.id}`)
                          }
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Analisar
                        </Button>
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
