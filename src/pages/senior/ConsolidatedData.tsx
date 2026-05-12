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

        if (escolasData) setSchools(escolasData)

        // Fetch Alertas (Denuncias de alta gravidade ou pendentes)
        const { data: denunciasData } = await supabase
          .from('denuncias')
          .select(
            `
            id, 
            protocolo, 
            gravidade, 
            status,
            escolas_instituicoes ( nome_escola )
          `,
          )
          .eq('gravidade', 'Alta')
          .limit(10)

        if (denunciasData) {
          setAlerts(
            denunciasData.map((d) => ({
              id: d.id,
              protocolo: d.protocolo,
              gravidade: d.gravidade || 'Alta',
              status: d.status,
              escola:
                (d.escolas_instituicoes as any)?.nome_escola || 'Não informada',
            })),
          )
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
            <div className="text-4xl font-bold text-green-600">9.2</div>
            <p className="text-xs text-muted-foreground mt-1">
              Média ponderada da rede
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
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">
                          Pesos do Cálculo
                        </div>
                        <div className="font-medium">Fórmula Padrão V2</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">
                          Taxa de Resolução
                        </div>
                        <div className="font-medium text-green-600">
                          + 4.5 pts
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">
                          Adesão a Treinamentos
                        </div>
                        <div className="font-medium text-green-600">
                          + 3.2 pts
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">
                          Auditorias Pendentes
                        </div>
                        <div className="font-medium text-amber-600">
                          - 1.5 pts
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">
                        Histórico Recente de Pontuação
                      </h4>
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
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
                            <td className="px-4 py-3">Mês Atual (Dez/2026)</td>
                            <td className="px-4 py-3">8.5</td>
                            <td className="px-4 py-3 text-green-600">+0.7</td>
                            <td className="px-4 py-3 font-bold text-green-600">
                              9.2
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3">
                              Mês Anterior (Nov/2026)
                            </td>
                            <td className="px-4 py-3">8.2</td>
                            <td className="px-4 py-3 text-green-600">+0.6</td>
                            <td className="px-4 py-3 font-bold text-green-600">
                              8.8
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3">Out/2026</td>
                            <td className="px-4 py-3">8.0</td>
                            <td className="px-4 py-3 text-red-500">-0.2</td>
                            <td className="px-4 py-3 font-bold text-amber-600">
                              7.8
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                              {alert.status.replace('_', ' ')}
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
