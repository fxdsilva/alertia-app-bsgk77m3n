import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { PieChart, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { complianceService } from '@/services/complianceService'
import useAppStore from '@/stores/useAppStore'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function RiskManagementDashboard() {
  const { user, profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [risks, setRisks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appLoading && profile !== 'ANALISTA_COMPLIANCE') {
      navigate('/')
      return
    }
  }, [profile, appLoading, navigate])

  useEffect(() => {
    if (user && profile === 'ANALISTA_COMPLIANCE') {
      fetchData()
    }
  }, [user, profile])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (!user) return
      const data = await complianceService.getAnalystRiskMatrix(user.id)
      setRisks(data || [])
    } catch (error) {
      console.error('Error fetching risk matrix:', error)
      toast.error('Erro ao carregar matriz de riscos')
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelBadge = (level: string | null) => {
    const l = (level || 'Desconhecido').toLowerCase()

    if (l.includes('crítico') || l.includes('alto')) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {level || 'Alto'}
        </Badge>
      )
    }
    if (l.includes('médio')) {
      return (
        <Badge
          variant="secondary"
          className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 gap-1"
        >
          <AlertTriangle className="h-3 w-3" />
          {level || 'Médio'}
        </Badge>
      )
    }
    if (l.includes('baixo')) {
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 gap-1"
        >
          <ShieldCheck className="h-3 w-3" />
          {level || 'Baixo'}
        </Badge>
      )
    }

    return <Badge variant="outline">{level || 'N/A'}</Badge>
  }

  if (loading || appLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Riscos</h1>
        <p className="text-muted-foreground">
          Matriz de riscos e controles internos das instituições monitoradas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <CardTitle>Matriz de Riscos</CardTitle>
          </div>
          <CardDescription>
            Identificação, avaliação e mitigação de riscos institucionais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <AlertTriangle className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-lg font-medium">
                Nenhum risco registrado sob sua responsabilidade.
              </p>
              <p className="text-sm">
                Os riscos identificados nas instituições aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Instituição</TableHead>
                    <TableHead>Descrição do Risco</TableHead>
                    <TableHead>Probabilidade</TableHead>
                    <TableHead>Impacto</TableHead>
                    <TableHead>Nível de Risco</TableHead>
                    <TableHead className="w-[300px]">
                      Plano de Mitigação
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell className="font-medium">
                        {risk.escolas_instituicoes?.nome_escola || 'N/A'}
                      </TableCell>
                      <TableCell
                        className="max-w-[300px] truncate"
                        title={risk.risco}
                      >
                        {risk.risco}
                      </TableCell>
                      <TableCell>{risk.probabilidade || '-'}</TableCell>
                      <TableCell>{risk.impacto || '-'}</TableCell>
                      <TableCell>
                        {getRiskLevelBadge(risk.nivel_risco_calculado)}
                      </TableCell>
                      <TableCell
                        className="text-sm text-muted-foreground max-w-[300px] truncate"
                        title={risk.plano_mitigacao}
                      >
                        {risk.plano_mitigacao || 'Não definido'}
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
