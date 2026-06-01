import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import {
  Building2,
  AlertTriangle,
  SearchCheck,
  Scale,
  BarChart3,
  FileText,
  Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'

export default function SecretaryDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    async function loadStats() {
      try {
        const { data, error } = await supabase.rpc(
          'get_secretary_dashboard_stats',
        )
        if (error) throw error

        if (data) {
          setStats(data)
        }
      } catch (err: any) {
        console.error('Error loading stats:', err)
        toast({
          title: 'Erro ao carregar dados',
          description:
            err.message || 'Não foi possível carregar as estatísticas da rede.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [toast])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const schools = stats?.schools || []
  const totalSchools = stats?.totalSchools || 0

  const totalComplaints = schools.reduce(
    (acc: number, school: any) => acc + (school.complaintsCount || 0),
    0,
  )
  const totalInvestigations = schools.reduce(
    (acc: number, school: any) => acc + (school.investigationsCount || 0),
    0,
  )
  const totalMediations = schools.reduce(
    (acc: number, school: any) => acc + (school.mediationsCount || 0),
    0,
  )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visão Geral da Rede
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento estratégico das escolas da rede
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-0 bg-white ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total de Escolas
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalSchools}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Denúncias Ativas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalComplaints}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Investigações em Curso
            </CardTitle>
            <SearchCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalInvestigations}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Mediações Ativas
            </CardTitle>
            <Scale className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalMediations}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-0 bg-white ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle>Ferramentas Institucionais</CardTitle>
          <CardDescription>
            Acesse os relatórios consolidados e a gestão da rede
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:text-blue-700 transition-colors"
              onClick={() => navigate('/admin/reports')}
            >
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="font-semibold text-center">
                Relatórios da Rede
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:text-purple-700 transition-colors"
              onClick={() => navigate('/senior/consolidated')}
            >
              <FileText className="h-8 w-8 text-purple-600" />
              <span className="font-semibold text-center">
                Visão Consolidada
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
              onClick={() => navigate('/senior/schools')}
            >
              <Building2 className="h-8 w-8 text-emerald-600" />
              <span className="font-semibold text-center">
                Lista de Escolas
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-0 bg-white ring-1 ring-slate-100 overflow-hidden">
        <CardHeader>
          <CardTitle>Escolas da Rede</CardTitle>
          <CardDescription>Resumo dos indicadores por escola</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Escola</th>
                <th className="px-6 py-4 font-semibold">Localização</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Denúncias
                </th>
                <th className="px-6 py-4 font-semibold text-center">
                  Investigações
                </th>
                <th className="px-6 py-4 font-semibold text-center">
                  Mediações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schools.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Nenhuma escola encontrada ou vinculada.
                  </td>
                </tr>
              ) : (
                schools.map((school: any) => (
                  <tr
                    key={school.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {school.nome_escola}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {school.localizacao}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-medium text-xs">
                        {school.complaintsCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-medium text-xs">
                        {school.investigationsCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium text-xs">
                        {school.mediationsCount || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
