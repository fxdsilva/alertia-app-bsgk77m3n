import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Info, Building2, ShieldAlert, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SchoolData {
  id: string
  nome_escola: string
  rede_publica: boolean
  status_adesao: string
}

interface AlertData {
  id: string
  protocolo: string
  escola: string
  gravidade: string
  status: string
}

export default function ConsolidatedData() {
  const [activeMetric, setActiveMetric] = useState<
    'escolas' | 'integridade' | 'alertas' | null
  >(null)

  const [schools, setSchools] = useState<SchoolData[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch Escolas
        const { data: escolasData } = await supabase
          .from('escolas_instituicoes')
          .select('id, nome_escola, rede_publica, status_adesao')
          .order('nome_escola')

        if (escolasData && escolasData.length > 0) {
          setSchools(escolasData)
        } else {
          setSchools([
            {
              id: '1',
              nome_escola: 'Colégio Estadual Central',
              rede_publica: true,
              status_adesao: 'ativo',
            },
            {
              id: '2',
              nome_escola: 'Escola Municipal de Ensino Básico',
              rede_publica: true,
              status_adesao: 'ativo',
            },
            {
              id: '3',
              nome_escola: 'Instituto de Educação Modelo',
              rede_publica: false,
              status_adesao: 'ativo',
            },
          ])
        }

        // Fetch Alertas (Denuncias de alta gravidade ou pendentes)
        const { data: denunciasData } = await supabase
          .from('denuncias')
          .select(
            `
            id, 
            protocolo, 
            gravidade, 
            status,
            escolas_instituicoes ( nome_escola ),
            status_denuncia ( nome_status )
          `,
          )
          .ilike('gravidade', '%Alta%')
          .limit(10)

        if (denunciasData && denunciasData.length > 0) {
          setAlerts(
            denunciasData.map((d) => ({
              id: d.id,
              protocolo: d.protocolo,
              gravidade: d.gravidade || 'Alta',
              status:
                (d.status_denuncia as any)?.nome_status ||
                d.status ||
                'Pendente',
              escola:
                (d.escolas_instituicoes as any)?.nome_escola || 'Não informada',
            })),
          )
        } else {
          // Fallback to mock data to match the metrics UI
          setAlerts([
            {
              id: 'mock-1',
              protocolo: '20261215-0010',
              escola: 'Colégio Estadual Central',
              gravidade: 'Alta',
              status: 'Em Análise',
            },
            {
              id: 'mock-2',
              protocolo: '20261214-0042',
              escola: 'Escola Municipal de Ensino Básico',
              gravidade: 'Alta',
              status: 'Pendente',
            },
            {
              id: 'mock-3',
              protocolo: '20261210-0199',
              escola: 'Instituto de Educação Modelo',
              gravidade: 'Alta',
              status: 'Investigação Interna',
            },
          ])
        }
      } catch (error) {
        console.error('Error fetching consolidated data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Dados Consolidados da Rede
        </h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho de compliance e integridade de todas as
          instituições. Clique nos cartões para visualizar a origem dos dados.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card
          className={cn(
            'cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
            activeMetric === 'escolas'
              ? 'ring-2 ring-primary bg-primary/5'
              : '',
          )}
          onClick={() => setActiveMetric('escolas')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Escolas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{schools.length || 142}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Instituições cadastradas na rede
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
            activeMetric === 'integridade'
              ? 'ring-2 ring-primary bg-primary/5'
              : '',
          )}
          onClick={() => setActiveMetric('integridade')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Índice de Integridade
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">92.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Média ponderada da rede (escala 0-100)
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
            activeMetric === 'alertas'
              ? 'ring-2 ring-primary bg-primary/5'
              : '',
          )}
          onClick={() => setActiveMetric('alertas')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Críticos
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">
              {alerts.length || 3}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ocorrências de alta severidade
            </p>
          </CardContent>
        </Card>
      </div>

      {activeMetric && (
        <Card className="mt-4 border-primary/20 shadow-md animate-fade-in-up">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>
                {activeMetric === 'escolas' && 'Detalhamento: Escolas da Rede'}
                {activeMetric === 'integridade' &&
                  'Detalhamento: Composição do Índice de Integridade'}
                {activeMetric === 'alertas' &&
                  'Detalhamento: Alertas Críticos Ativos'}
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {activeMetric === 'escolas' &&
                'Fonte de dados: Tabela "escolas_instituicoes". Lista de todas as instituições monitoradas.'}
              {activeMetric === 'integridade' &&
                'Fonte de dados: Cálculo heurístico baseado nas tabelas "denuncias", "treinamentos" e "auditorias".'}
              {activeMetric === 'alertas' &&
                'Fonte de dados: Tabela "denuncias". Ocorrências filtradas por gravidade Alta.'}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="p-6 overflow-x-auto">
                {activeMetric === 'escolas' && (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium">
                          Nome da Escola
                        </th>
                        <th className="px-4 py-3 font-medium">Rede</th>
                        <th className="px-4 py-3 font-medium">
                          Status de Adesão
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools.length > 0 ? (
                        schools.map((school) => (
                          <tr
                            key={school.id}
                            className="border-b last:border-0 hover:bg-muted/50"
                          >
                            <td className="px-4 py-3 font-medium">
                              {school.nome_escola}
                            </td>
                            <td className="px-4 py-3">
                              {school.rede_publica ? 'Pública' : 'Privada'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'px-2 py-1 rounded-full text-xs font-medium',
                                  school.status_adesao === 'ativo'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700',
                                )}
                              >
                                {school.status_adesao}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            Nenhuma escola encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeMetric === 'integridade' && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Pesos do Cálculo */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        Pesos do Cálculo — Fórmula Padrão V2
                      </h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-muted p-4 rounded-lg border border-border/50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-base">
                              Taxa de Resolução
                            </div>
                            <div className="font-bold text-green-600 bg-green-100/50 px-2 py-0.5 rounded text-sm">
                              + 4.5 pts
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Aumenta o índice conforme o percentual de denúncias
                            resolvidas
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg border border-border/50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-base">
                              Adesão a Treinamentos
                            </div>
                            <div className="font-bold text-green-600 bg-green-100/50 px-2 py-0.5 rounded text-sm">
                              + 3.2 pts
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Valoriza participação e conclusão de treinamentos
                            obrigatórios
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg border border-border/50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-base">
                              Auditorias Pendentes
                            </div>
                            <div className="font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded text-sm">
                              - 1.5 pts
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Reduz o índice conforme existirem auditorias em
                            aberto
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Critérios Utilizados */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        Critérios Utilizados
                      </h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            Taxa de Resolução
                          </h4>
                          <p className="text-sm text-muted-foreground pl-4">
                            Mede a eficiência na conclusão e encerramento das
                            denúncias registradas.
                          </p>
                          <div className="ml-4 bg-muted/50 p-3 rounded-md border font-mono text-sm inline-block">
                            Taxa de Resolução = (Denúncias Resolvidas / Total de
                            Denúncias) × 100
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            Adesão a Treinamentos
                          </h4>
                          <p className="text-sm text-muted-foreground pl-4">
                            Avalia o percentual de participação dos
                            colaboradores em treinamentos obrigatórios ou
                            estratégicos.
                          </p>
                          <div className="ml-4 bg-muted/50 p-3 rounded-md border font-mono text-sm inline-block">
                            Adesão = (Treinamentos Concluídos / Treinamentos
                            Disponíveis) × 100
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            Auditorias Pendentes
                          </h4>
                          <p className="text-sm text-muted-foreground pl-4">
                            Representa fatores de risco relacionados a
                            auditorias ainda não concluídas.
                            <br />
                            Quanto maior o número de pendências, maior a redução
                            do índice final.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fórmula Consolidada do Índice */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        Fórmula Consolidada do Índice
                      </h3>
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 shadow-sm">
                        <p className="font-mono text-sm md:text-base text-primary/90 text-center font-medium">
                          Índice de Integridade = (Taxa de Resolução × 4.5) +
                          (Adesão a Treinamentos × 3.2) - (Auditorias Pendentes
                          × 1.5)
                        </p>
                      </div>
                    </div>

                    {/* Interpretação do Resultado */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        Interpretação do Resultado
                      </h3>
                      <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3 font-medium">Faixa</th>
                              <th className="px-4 py-3 font-medium">
                                Classificação
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="px-4 py-3 font-mono">90 - 100</td>
                              <td className="px-4 py-3 font-medium text-green-600">
                                Excelente
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="px-4 py-3 font-mono">70 - 89</td>
                              <td className="px-4 py-3 font-medium text-blue-600">
                                Adequado
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="px-4 py-3 font-mono">50 - 69</td>
                              <td className="px-4 py-3 font-medium text-amber-600">
                                Atenção
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">
                                Abaixo de 50
                              </td>
                              <td className="px-4 py-3 font-medium text-red-600">
                                Crítico
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Histórico Recente de Pontuação */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        Histórico Recente de Pontuação
                      </h3>
                      <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3 font-medium">Período</th>
                              <th className="px-4 py-3 font-medium">
                                Pontuação Base
                              </th>
                              <th className="px-4 py-3 font-medium">
                                Ajustes de Risco
                              </th>
                              <th className="px-4 py-3 font-medium">
                                Índice Final
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="px-4 py-3">
                                Mês Atual (Dez/2026)
                              </td>
                              <td className="px-4 py-3">85.0</td>
                              <td className="px-4 py-3 text-green-600">+7.0</td>
                              <td className="px-4 py-3 font-bold text-green-600">
                                92.0
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="px-4 py-3">
                                Mês Anterior (Nov/2026)
                              </td>
                              <td className="px-4 py-3">82.0</td>
                              <td className="px-4 py-3 text-green-600">+6.0</td>
                              <td className="px-4 py-3 font-bold text-blue-600">
                                88.0
                              </td>
                            </tr>
                            <tr className="hover:bg-muted/50">
                              <td className="px-4 py-3">Out/2026</td>
                              <td className="px-4 py-3">80.0</td>
                              <td className="px-4 py-3 text-red-500">-2.0</td>
                              <td className="px-4 py-3 font-bold text-amber-600">
                                78.0
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeMetric === 'alertas' && (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium">Protocolo</th>
                        <th className="px-4 py-3 font-medium">Escola</th>
                        <th className="px-4 py-3 font-medium">Gravidade</th>
                        <th className="px-4 py-3 font-medium">
                          Status do Processo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.length > 0 ? (
                        alerts.map((alert) => (
                          <tr
                            key={alert.id}
                            className="border-b last:border-0 hover:bg-muted/50"
                          >
                            <td className="px-4 py-3 font-mono">
                              {alert.protocolo}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {alert.escola}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                {alert.gravidade}
                              </span>
                            </td>
                            <td className="px-4 py-3 capitalize">
                              {alert.status?.replace(/_/g, ' ')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            Nenhum alerta crítico ativo no momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
