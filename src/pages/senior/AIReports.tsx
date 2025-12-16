import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function AIReports() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Sparkles className="text-secondary" />
        Relatórios Estratégicos (IA)
      </h1>
      <Card className="border-l-4 border-l-secondary">
        <CardHeader>
          <CardTitle>Análise Preditiva: Clima Escolar</CardTitle>
          <CardDescription>Gerado por ALERTIA AI em 16/12/2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            A análise de sentimentos baseada nas denúncias anônimas e feedbacks
            de treinamentos indica um aumento de 15% na tensão relacionada a
            "Prazos Acadêmicos" no último trimestre.
          </p>
          <p className="font-semibold">Recomendação:</p>
          <p>
            Iniciar programa de apoio psicológico preventivo e revisar
            calendário de avaliações.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
