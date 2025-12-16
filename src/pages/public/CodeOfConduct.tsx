import useAppStore from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function CodeOfConduct() {
  const { selectedSchool } = useAppStore()

  return (
    <div className="container mx-auto max-w-4xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary">
        Código de Conduta e Ética
      </h1>
      <p className="text-lg text-muted-foreground">
        Diretrizes oficiais para {selectedSchool?.name || 'a Instituição'}.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Princípios Fundamentais</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-justify leading-relaxed">
              <h3 className="text-xl font-semibold">1. Introdução</h3>
              <p>
                Este Código de Conduta estabelece os padrões éticos e
                profissionais que devem guiar todas as ações e decisões dentro
                da nossa comunidade escolar. Ele se aplica a alunos,
                professores, funcionários, gestores e parceiros.
              </p>

              <h3 className="text-xl font-semibold">2. Respeito Mútuo</h3>
              <p>
                A base de nossa convivência é o respeito. Não toleramos qualquer
                forma de discriminação, assédio, bullying ou violência.
                Valorizamos a diversidade e a inclusão como pilares de um
                ambiente educacional saudável.
              </p>

              <h3 className="text-xl font-semibold">
                3. Integridade Acadêmica
              </h3>
              <p>
                A honestidade é vital para o aprendizado. Plágio, cola e
                qualquer forma de desonestidade acadêmica são infrações graves.
                Incentivamos a produção intelectual original e o respeito aos
                direitos autorais.
              </p>

              <h3 className="text-xl font-semibold">
                4. Proteção do Patrimônio
              </h3>
              <p>
                Todos são responsáveis por zelar pelos bens materiais e
                imateriais da escola. O uso indevido de recursos, equipamentos
                ou instalações é proibido.
              </p>

              <h3 className="text-xl font-semibold">
                5. Conflito de Interesses
              </h3>
              <p>
                Decisões devem ser tomadas sempre visando o melhor interesse da
                instituição e da comunidade escolar, evitando que interesses
                pessoais interfiram na imparcialidade.
              </p>

              <h3 className="text-xl font-semibold">6. Canal de Denúncias</h3>
              <p>
                Qualquer violação a este código deve ser reportada através dos
                canais oficiais, garantindo-se o anonimato e a não retaliação ao
                denunciante de boa-fé.
              </p>

              <div className="p-4 bg-muted rounded-md mt-8">
                <p className="text-sm italic text-center">
                  Documento atualizado em 01/01/2024. Aprovado pelo Conselho
                  Escolar.
                </p>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
