import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  School,
  AlertTriangle,
  FileCheck,
  Scale,
  GraduationCap,
  Building2,
} from 'lucide-react'
import {
  secretaryService,
  DashboardSummary,
  SecretaryDashboardConfig,
} from '@/services/secretaryService'
import useAppStore from '@/stores/useAppStore'
import { Navigate } from 'react-router-dom'

export default function SecretaryDashboard() {
  const { profile } = useAppStore()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [config, setConfig] = useState<SecretaryDashboardConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [dashData, dashConfig] = await Promise.all([
          secretaryService.getDashboardData(),
          secretaryService.getSecretaryConfig(),
        ])
        setData(dashData)
        setConfig(dashConfig)
      } catch (error) {
        console.error('Error loading secretary dashboard data', error)
      } finally {
        setLoading(false)
      }
    }

    if (profile === 'SECRETARIA DE EDUCAÇÃO') {
      loadData()
    } else {
      setLoading(false)
    }
  }, [profile])

  if (profile !== 'SECRETARIA DE EDUCAÇÃO' && !loading) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">
          {config?.welcomeMessage || 'Painel da Secretaria de Educação'}
        </h1>
        <p className="text-slate-500 text-lg">
          Visão geral institucional e métricas por escola da rede.
        </p>
      </div>

      {/* Visão Geral */}
      {config?.showStats !== false && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-primary/5 border-primary/20 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Total de
                  Escolas
                </span>
                <span className="text-3xl font-bold text-primary">
                  {data.totalSchools}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />{' '}
                  Denúncias Ativas
                </span>
                <span className="text-3xl font-bold text-slate-800">
                  {data.totalComplaints}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-blue-500" /> Investigações
                </span>
                <span className="text-3xl font-bold text-slate-800">
                  {data.totalInvestigations}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-500" /> Mediações
                </span>
                <span className="text-3xl font-bold text-slate-800">
                  {data.totalMediations}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-500" />{' '}
                  Treinamentos
                </span>
                <span className="text-3xl font-bold text-slate-800">
                  {data.totalTrainings}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas por Escola */}
      {config?.showSchools !== false && data && (
        <Card className="border-0 shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <School className="h-6 w-6 text-primary" />
              Resumo de Conformidade por Unidade Escolar
            </CardTitle>
            <CardDescription className="text-base mt-1.5">
              Acompanhamento detalhado de denúncias, investigações, mediações e
              treinamentos por escola da rede.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="w-[300px] text-slate-700 font-semibold py-4 px-6">
                      Unidade Escolar
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Rede / Esfera
                    </TableHead>
                    <TableHead className="text-center text-slate-700 font-semibold">
                      Denúncias
                    </TableHead>
                    <TableHead className="text-center text-slate-700 font-semibold">
                      Investigações
                    </TableHead>
                    <TableHead className="text-center text-slate-700 font-semibold">
                      Mediações
                    </TableHead>
                    <TableHead className="text-center text-slate-700 font-semibold">
                      Treinamentos
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.schools.map((school) => (
                    <TableRow
                      key={school.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <TableCell className="font-medium px-6 py-4">
                        <div className="text-slate-900">{school.name}</div>
                        <div className="text-xs text-slate-500 font-normal mt-1">
                          {school.municipality} • {school.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-medium text-xs bg-white text-slate-600 border-slate-200"
                          >
                            {school.network}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="font-medium text-xs bg-slate-100 text-slate-600"
                          >
                            {school.sphere}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            school.complaintsCount > 0
                              ? 'destructive'
                              : 'outline'
                          }
                          className={
                            school.complaintsCount === 0
                              ? 'bg-slate-50 text-slate-400 border-slate-200'
                              : ''
                          }
                        >
                          {school.complaintsCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            school.investigationsCount > 0
                              ? 'default'
                              : 'outline'
                          }
                          className={
                            school.investigationsCount > 0
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }
                        >
                          {school.investigationsCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            school.mediationsCount > 0 ? 'default' : 'outline'
                          }
                          className={
                            school.mediationsCount > 0
                              ? 'bg-purple-500 hover:bg-purple-600 text-white'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }
                        >
                          {school.mediationsCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            school.trainingsCount > 0 ? 'default' : 'outline'
                          }
                          className={
                            school.trainingsCount > 0
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }
                        >
                          {school.trainingsCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.schools.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-slate-500"
                      >
                        Nenhuma escola encontrada ou ativa no momento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
