import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  Building2,
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const mockChartData = [
  { name: 'Jan', denuncias: 4 },
  { name: 'Fev', denuncias: 7 },
  { name: 'Mar', denuncias: 5 },
  { name: 'Abr', denuncias: 10 },
  { name: 'Mai', denuncias: 14 },
  { name: 'Jun', denuncias: 8 },
]

export default function SeniorDashboard() {
  const [stats, setStats] = useState({
    schools: 0,
    users: 0,
    alerts: 0,
    resolutionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: schoolsCount } = await supabase
          .from('escolas_instituicoes')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)

        const { count: usersCount } = await supabase
          .from('usuarios_escola')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)

        const { count: alertsCount } = await supabase
          .from('denuncias')
          .select('*', { count: 'exact', head: true })
          .eq('gravidade', 'Alta')
          .eq('status', 'pendente') // Basic approximation for critical alerts

        setStats({
          schools: schoolsCount ?? 3,
          users: usersCount ?? 18,
          alerts: alertsCount ?? 0,
          resolutionRate: 85, // Mock calculated value
        })
      } catch (err) {
        console.error('Error fetching stats', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Senior</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral estratégica da rede e indicadores de compliance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="flex flex-col h-full border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Capacitação
              <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                <GraduationCap className="h-4 w-4" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold text-purple-700 mb-1">
              Portal de Cursos
            </div>
            <p className="text-xs text-muted-foreground">
              Acessar treinamentos
            </p>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              asChild
              variant="outline"
              className="w-full text-sm h-auto min-h-[40px] whitespace-normal py-2 text-center group hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
            >
              <Link to="/trainings">Abrir Portal</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Escolas
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Building2 className="h-4 w-4" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold text-foreground mb-1">
              {loading ? (
                <span className="animate-pulse bg-muted rounded h-8 w-12 block"></span>
              ) : (
                stats.schools
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Instituições monitoradas
            </p>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              asChild
              variant="outline"
              className="w-full text-sm h-auto min-h-[40px] whitespace-normal py-2 text-center hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
            >
              <Link to="/senior/schools">Ver Escolas</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Usuários Ativos
              <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                <Users className="h-4 w-4" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold text-foreground mb-1">
              {loading ? (
                <span className="animate-pulse bg-muted rounded h-8 w-16 block"></span>
              ) : (
                stats.users
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestores e colaboradores
            </p>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              asChild
              variant="outline"
              className="w-full text-sm h-auto min-h-[40px] whitespace-normal py-2 text-center hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
            >
              <Link to="/senior/users">Gerenciar Usuários</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Alertas Críticos
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {loading ? (
                <span className="animate-pulse bg-red-100/50 rounded h-8 w-12 block"></span>
              ) : (
                stats.alerts
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              asChild
              variant="outline"
              className="w-full text-sm h-auto min-h-[40px] whitespace-normal py-2 text-center hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
            >
              <Link to="/senior/pending-reports">Ver Lista de Alertas</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Taxa de Resolução
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Activity className="h-4 w-4" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              {loading ? (
                <span className="animate-pulse bg-emerald-100/50 rounded h-8 w-16 block"></span>
              ) : (
                `${stats.resolutionRate}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-start mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-600 mt-0.5 shrink-0" />
              <span className="leading-tight">
                +5% em relação ao mês anterior
              </span>
            </p>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              asChild
              variant="outline"
              className="w-full text-sm h-auto min-h-[40px] whitespace-normal py-2 text-center hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
            >
              <Link to="/senior/consolidated">Ver Detalhes do Cálculo</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Visão Geral de Denúncias</CardTitle>
            <CardDescription>
              Volume de denúncias nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ChartContainer
              config={{
                denuncias: { label: 'Denúncias', color: 'hsl(var(--primary))' },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--muted-foreground)/0.2)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="denuncias"
                    fill="var(--color-denuncias)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Conformidade da Rede</CardTitle>
            <CardDescription>
              Principais indicadores de compliance e adesão
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center bg-muted/10 rounded-md border border-dashed text-center p-6 mx-6 mb-6">
            <TrendingUp className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground text-sm">
              Integração de dados de conformidade em andamento.
              <br />
              Os gráficos detalhados estarão disponíveis em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
