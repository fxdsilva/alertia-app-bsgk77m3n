import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConsolidatedData() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dados Consolidados da Rede</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Total de Escolas</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold">142</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Índice de Integridade</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-green-600">
            9.2
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas Críticos</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-red-600">
            3
          </CardContent>
        </Card>
      </div>
      {/* Add more charts here using ChartContainer */}
    </div>
  )
}
