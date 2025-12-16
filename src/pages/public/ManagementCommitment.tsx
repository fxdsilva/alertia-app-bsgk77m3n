import useAppStore from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Quote } from 'lucide-react'

export default function ManagementCommitment() {
  const { selectedSchool } = useAppStore()

  return (
    <div className="container mx-auto max-w-4xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary">
        Compromisso da Alta Gestão
      </h1>

      <Card className="border-l-4 border-l-secondary bg-background shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-6 w-6 text-secondary" />
            Palavra da Direção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg leading-relaxed">
          <p>
            Nós, da direção da <strong>{selectedSchool?.name}</strong>,
            reafirmamos nosso compromisso inabalável com a ética, a integridade
            e a transparência em todas as nossas atividades educacionais e
            administrativas.
          </p>
          <p>
            Entendemos que a educação vai além da sala de aula; ela se constrói
            no exemplo diário de conduta. Por isso, implementamos o Programa de
            Integridade ALERTIA, não apenas para cumprir normas, mas para
            cultivar uma cultura onde fazer o certo é o único caminho.
          </p>
          <p>
            Garantimos que todas as denúncias trazidas ao nosso conhecimento
            serão tratadas com seriedade, confidencialidade e isenção. Não
            toleraremos retaliações contra quem, de boa-fé, reportar
            irregularidades.
          </p>
          <div className="mt-8 pt-8 border-t flex flex-col items-end">
            <img
              src="https://img.usecurling.com/i?q=signature&shape=hand-drawn"
              alt="Assinatura"
              className="h-16 opacity-70 mb-2"
            />
            <p className="font-bold">Diretoria Geral</p>
            <p className="text-sm text-muted-foreground">
              {selectedSchool?.name}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
