import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, Eye, ArrowRight } from 'lucide-react'
import { complianceService } from '@/services/complianceService'
import useAppStore from '@/stores/useAppStore'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ComplaintsDashboard() {
  const { user, profile } = useAppStore()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile === 'ANALISTA_COMPLIANCE') {
      fetchData()
    } else {
      // Redirect if not analyst, handled by App logic generally but good to be safe
      if (!loading && profile !== 'ANALISTA_COMPLIANCE') navigate('/')
    }
  }, [user, profile])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (!user) return
      const data = await complianceService.getAnalystComplaints(user.id)
      setComplaints(data || [])
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error('Erro ao carregar denúncias')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (complaint: any) => {
    // Navigate to Workflow Task if available, otherwise a generic detail or just list
    // Since workflow is the main way to handle complaints now
    navigate(`/compliance/analyst/workflow/${complaint.id}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minhas Denúncias</h1>
        <p className="text-muted-foreground">
          Gestão e acompanhamento das denúncias atribuídas a você.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>Ocorrências Atribuídas</CardTitle>
          </div>
          <CardDescription>
            Lista completa de denúncias onde você figura como analista
            responsável em qualquer fase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mb-2 opacity-20" />
              <p>Nenhuma denúncia encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">
                      {c.protocolo}
                    </TableCell>
                    <TableCell>
                      {format(new Date(c.created_at), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {c.escolas_instituicoes?.nome_escola || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="truncate max-w-[200px]"
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.gravidade === 'Alta' || c.gravidade === 'Crítica'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {c.gravidade || 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(c)}
                        className="gap-2"
                      >
                        Visualizar <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
