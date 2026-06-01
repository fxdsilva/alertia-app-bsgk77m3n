import { useState, useEffect, useMemo } from 'react'
import {
  Building2,
  ShieldAlert,
  Search,
  BookOpen,
  BarChart3,
  Share2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

import { secretaryService, DashboardSummary } from '@/services/secretaryService'

export default function SecretaryDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await secretaryService.getDashboardData()
        setData(summary)
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredSchools = useMemo(() => {
    if (!data) return []
    return data.schools.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.network.toLowerCase().includes(search.toLowerCase()),
    )
  }, [data, search])

  const chartData = useMemo(() => {
    return filteredSchools.slice(0, 10).map((s) => ({
      name: s.name,
      complaints: s.complaintsCount,
      investigations: s.investigationsCount,
      trainings: s.trainingsCount,
    }))
  }, [filteredSchools])

  const chartConfig = {
    complaints: {
      label: 'Denúncias',
      color: 'hsl(var(--destructive))',
    },
    investigations: {
      label: 'Investigações',
      color: '#f97316',
    },
    trainings: {
      label: 'Treinamentos',
      color: 'hsl(var(--primary))',
    },
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Painel da Secretaria
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral e ferramentas institucionais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/share">
              <Share2 className="h-4 w-4" />
              Compartilhar App
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Escolas
            </CardTitle>
            <div className="p-2 bg-muted rounded-md">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalSchools || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Na rede de ensino
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-destructive/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Denúncias Ativas
            </CardTitle>
            <div className="p-2 bg-destructive/10 rounded-md">
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {data?.totalComplaints || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando tratativa
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-orange-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investigações
            </CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-md">
              <Search className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.totalInvestigations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Treinamentos
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-md">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data?.totalTrainings || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ativos na rede</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Resumo de Conformidade
            </CardTitle>
            <CardDescription>
              Comparativo de ocorrências nas principais unidades escolares
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) =>
                      value.substring(0, 12) + (value.length > 12 ? '...' : '')
                    }
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="complaints"
                    fill="var(--color-complaints)"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="investigations"
                    fill="var(--color-investigations)"
                    radius={[0, 0, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="trainings"
                    fill="var(--color-trainings)"
                    radius={[0, 0, 4, 4]}
                    stackId="a"
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[320px] items-center justify-center text-muted-foreground flex-col gap-2">
                <BarChart3 className="h-10 w-10 opacity-20" />
                <span>Dados insuficientes para exibição do gráfico.</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Ferramentas institucionais</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 flex-1 p-6">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12 hover:border-destructive/50 hover:bg-destructive/5"
            >
              <Link to="/compliance/director/complaints">
                <ShieldAlert className="h-4 w-4 mr-3 text-destructive" />
                Gerenciar Denúncias
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12 hover:border-orange-500/50 hover:bg-orange-500/5"
            >
              <Link to="/senior/workflow">
                <Search className="h-4 w-4 mr-3 text-orange-500" />
                Fluxo de Conformidade
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12 hover:border-primary/50 hover:bg-primary/5"
            >
              <Link to="/trainings">
                <BookOpen className="h-4 w-4 mr-3 text-primary" />
                Base de Treinamentos
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start h-12 hover:border-emerald-500/50 hover:bg-emerald-500/5"
            >
              <Link to="/senior/schools">
                <Building2 className="h-4 w-4 mr-3 text-emerald-500" />
                Gestão de Escolas
              </Link>
            </Button>

            <div className="mt-auto pt-6">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-5 border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Share2 className="w-16 h-16 text-primary" />
                </div>
                <h4 className="font-semibold text-primary mb-1 relative z-10">
                  Cultura de Transparência
                </h4>
                <p className="text-sm text-muted-foreground mb-4 relative z-10">
                  Convide novos membros e fortaleça a rede de integridade.
                </p>
                <Button
                  asChild
                  className="w-full relative z-10 shadow-md"
                  size="sm"
                >
                  <Link to="/share">Convidar Colegas</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-muted/20">
          <div>
            <CardTitle>Métricas por Escola</CardTitle>
            <CardDescription>
              Detalhamento de indicadores por unidade escolar
            </CardDescription>
          </div>
          <div className="flex items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar escola ou rede..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Escola</th>
                  <th className="px-6 py-4 font-medium">Rede</th>
                  <th className="px-6 py-4 font-medium text-center">
                    Denúncias
                  </th>
                  <th className="px-6 py-4 font-medium text-center">
                    Investigações
                  </th>
                  <th className="px-6 py-4 font-medium text-center">
                    Mediações
                  </th>
                  <th className="px-6 py-4 font-medium text-center">
                    Treinamentos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school) => (
                    <tr
                      key={school.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                        {school.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border">
                          {school.network}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${school.complaintsCount > 0 ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-muted text-muted-foreground'}`}
                        >
                          {school.complaintsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${school.investigationsCount > 0 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-muted text-muted-foreground'}`}
                        >
                          {school.investigationsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${school.mediationsCount > 0 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-muted text-muted-foreground'}`}
                        >
                          {school.mediationsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${school.trainingsCount > 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}
                        >
                          {school.trainingsCount}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building2 className="h-8 w-8 opacity-20" />
                        <p>
                          Nenhuma escola encontrada para os filtros aplicados.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
