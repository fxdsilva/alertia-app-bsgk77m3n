import { useState, useEffect } from 'react'
import useAppStore from '@/stores/useAppStore'
import { adminService } from '@/services/adminService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export default function Reports() {
  const { selectedSchool } = useAppStore()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedSchool) return
      try {
        const data = await adminService.getComplaintStats(selectedSchool.id)
        setStats(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchStats()
  }, [selectedSchool])

  if (!stats) return <div className="p-6">Carregando relatórios...</div>

  const chartData = Object.keys(stats.byStatus).map((key) => ({
    name: key,
    value: stats.byStatus[key],
  }))

  const chartConfig = {
    count: {
      label: 'Quantidade',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Relatórios da Escola</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de Denúncias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Desde o início</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Denúncias por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
