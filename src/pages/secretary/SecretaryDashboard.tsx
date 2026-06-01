import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { secretaryService, DashboardSummary } from '@/services/secretaryService'
import {
  Building2,
  AlertTriangle,
  FileCheck,
  Scale,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
} from 'recharts'
import { ScrollArea } from '@/components/ui/scroll-area'

const chartConfig = {
  value: {
    label: 'Total',
    color: 'hsl(var(--primary))',
  },
}

export default function SecretaryDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await secretaryService.getDashboardData()
      setSummary(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setReportLoading(true)
    try {
      const data = await secretaryService.getNetworkReportData()

      const categoryCount: Record<string, number> = {}
      const gravityCount: Record<string, number> = {}
      const statusCount: Record<string, number> = {}

      const statusMap = new Map(
        data.statuses.map((s: any) => [s.id, s.nome_status]),
      )

      data.denuncias.forEach((d: any) => {
        if (d.categoria && Array.isArray(d.categoria)) {
          d.categoria.forEach((cat: string) => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1
          })
        } else if (d.categoria) {
          categoryCount[d.categoria] = (categoryCount[d.categoria] || 0) + 1
        }

        const grav = d.gravidade || 'Não definida'
        gravityCount[grav] = (gravityCount[grav] || 0) + 1

        const statusName = d.status
          ? statusMap.get(d.status) || 'Desconhecido'
          : 'Desconhecido'
        statusCount[statusName] = (statusCount[statusName] || 0) + 1
      })

      const categoriesChart = Object.entries(categoryCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

      const gravityChart = Object.entries(gravityCount).map(
        ([name, value]) => ({ name, value }),
      )
      const statusChart = Object.entries(statusCount).map(([name, value]) => ({
        name,
        value,
      }))

      setReportData({
        totalComplaints: data.denuncias.length,
        categoriesChart,
        gravityChart,
        statusChart,
      })
      setIsReportOpen(true)
    } catch (error) {
      console.error(error)
    } finally {
      setReportLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!summary) return null

  const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#6366f1',
    '#ec4899',
    '#f43f5e',
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Dashboard da Secretaria
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da rede de ensino e conformidade
          </p>
        </div>

        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={generateReport}
              disabled={reportLoading}
              className="gap-2 shadow-sm"
            >
              {reportLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              Gerar Relatório da Rede
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileCheck className="h-6 w-6 text-primary" />
                Relatório Consolidado de Denúncias
              </DialogTitle>
              <DialogDescription>
                Métricas e distribuição de denúncias em toda a rede de ensino.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[calc(90vh-140px)] pr-4 mt-2">
              {reportData && (
                <div className="space-y-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-primary/5 border-primary/20 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Activity className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Total de Denúncias
                            </p>
                            <h3 className="text-3xl font-bold text-foreground">
                              {reportData.totalComplaints}
                            </h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-50/50 border-orange-100 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Categorias Únicas
                            </p>
                            <h3 className="text-3xl font-bold text-foreground">
                              {reportData.categoriesChart.length}
                            </h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 border-green-100 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 rounded-full">
                            <Scale className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Status de Resolução
                            </p>
                            <h3 className="text-3xl font-bold text-foreground">
                              {reportData.statusChart.length}
                            </h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-muted-foreground" />
                          Status de Resolução
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[280px]">
                          <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={reportData.statusChart}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={2}
                                  dataKey="value"
                                  label={({ name, percent }) =>
                                    `${name} (${(percent * 100).toFixed(0)}%)`
                                  }
                                >
                                  {reportData.statusChart.map(
                                    (_: any, index: number) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                      />
                                    ),
                                  )}
                                </Pie>
                                <ChartTooltip
                                  content={<ChartTooltipContent />}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                          Distribuição por Gravidade
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[280px]">
                          <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={reportData.gravityChart}
                                margin={{ top: 20 }}
                              >
                                <XAxis
                                  dataKey="name"
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <ChartTooltip
                                  content={<ChartTooltipContent />}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="hsl(var(--primary))"
                                  radius={[4, 4, 0, 0]}
                                  maxBarSize={60}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Top 10 Categorias de Denúncias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ChartContainer config={chartConfig}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={reportData.categoriesChart}
                              layout="vertical"
                              margin={{ left: 20, right: 20 }}
                            >
                              <XAxis
                                type="number"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis
                                dataKey="name"
                                type="category"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={180}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar
                                dataKey="value"
                                fill="#8b5cf6"
                                radius={[0, 4, 4, 0]}
                                maxBarSize={40}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Escolas
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSchools}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Denúncias Ativas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalComplaints}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investigações
            </CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalInvestigations}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mediações
            </CardTitle>
            <Scale className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalMediations}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Escolas da Rede</CardTitle>
          <CardDescription>
            Visão geral de indicadores de conformidade por unidade escolar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Escola</TableHead>
                  <TableHead>Rede / Esfera</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead className="text-center">Denúncias</TableHead>
                  <TableHead className="text-center">Investigações</TableHead>
                  <TableHead className="text-center">Treinamentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.schools.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      Nenhuma escola encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.schools.map((school) => (
                    <TableRow key={school.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {school.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {school.network}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({school.sphere})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {school.municipality}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-semibold ${school.complaintsCount > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}
                        >
                          {school.complaintsCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-semibold ${school.investigationsCount > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}
                        >
                          {school.investigationsCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-green-600">
                          {school.trainingsCount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
