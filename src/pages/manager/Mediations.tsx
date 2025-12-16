import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Mediations() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mediação de Conflitos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Casos em Aberto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nenhum caso de mediação ativo no momento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
