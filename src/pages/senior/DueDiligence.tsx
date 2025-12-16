import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DueDiligence() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Due Diligence</h1>
      <Card>
        <CardHeader>
          <CardTitle>Verificações de Terceiros</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Lista de fornecedores e parceiros sob análise.</p>
        </CardContent>
      </Card>
    </div>
  )
}
