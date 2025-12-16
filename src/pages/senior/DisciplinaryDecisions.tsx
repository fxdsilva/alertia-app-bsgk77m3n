import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DisciplinaryDecisions() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Decisões Disciplinares</h1>
      <Card>
        <CardHeader>
          <CardTitle>Registro de Sanções</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Área restrita e confidencial.</p>
        </CardContent>
      </Card>
    </div>
  )
}
