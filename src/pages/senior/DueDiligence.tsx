import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, FileSearch, ShieldCheck, SearchCheck } from 'lucide-react'

export default function DueDiligence() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords() {
    try {
      const { data, error } = await supabase
        .from('due_diligence')
        .select(
          `
          *,
          escola:escolas_instituicoes(nome_escola),
          status_obj:status_due_diligence(nome_status)
        `,
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err) {
      console.error('Error fetching due diligence:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'baixo':
        return 'bg-green-100 text-green-800'
      case 'medio':
      case 'médio':
        return 'bg-yellow-100 text-yellow-800'
      case 'alto':
        return 'bg-orange-100 text-orange-800'
      case 'critico':
      case 'crítico':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <SearchCheck className="h-8 w-8 text-primary" />
          Due Diligence
        </h1>
        <p className="text-muted-foreground text-lg">
          Procedimento de estudo e investigação para analisar possíveis riscos
          que fornecedores, compradores, parceiros de negócios e demais
          stakeholders possam trazer para a instituição.
        </p>
      </div>

      <Tabs defaultValue="registros" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="registros">Registros</TabsTrigger>
          <TabsTrigger value="conceitos">Conceitos e Diretrizes</TabsTrigger>
        </TabsList>

        <TabsContent value="registros" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Investigações em Andamento</CardTitle>
              <CardDescription>
                Acompanhe o status e nível de risco das due diligences ativas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">Carregando...</div>
              ) : records.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornecedor/Parceiro</TableHead>
                        <TableHead>Instituição</TableHead>
                        <TableHead>Data Análise</TableHead>
                        <TableHead>Nível de Risco</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{record.fornecedor}</span>
                              <span className="text-xs text-muted-foreground">
                                {record.tipo_servico}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{record.escola?.nome_escola}</TableCell>
                          <TableCell>
                            {record.data_analise
                              ? format(
                                  new Date(record.data_analise),
                                  'dd/MM/yyyy',
                                  { locale: ptBR },
                                )
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {record.nivel_risco && (
                              <Badge
                                className={getRiskColor(record.nivel_risco)}
                                variant="outline"
                              >
                                {record.nivel_risco.toUpperCase()}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {record.status_obj?.nome_status || record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conceitos" className="mt-6 space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Principais Análises de Due Diligence
                </CardTitle>
                <CardDescription>
                  O que avaliamos durante o processo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Embora a diligência prévia tenha como objetivo realizar um
                  mapeamento completo das diferentes relações de uma empresa
                  (internamente e externamente), existem áreas específicas que
                  sempre são analisadas no processo, por terem um impacto maior
                  no negócio e na sua avaliação de mercado.
                </p>
                <div className="space-y-2 mt-4 bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    Due Diligence Jurídica
                  </h4>
                  <p>
                    A diligência prévia jurídica é um dos componentes mais
                    importantes para empresas que serão incorporadas ou fundidas
                    com terceiras, uma vez que analisa todas as questões e
                    pendências jurídicas que o negócio tem.
                  </p>
                  <p className="mt-2">
                    Nessa área, analisam-se o contrato social da empresa, seus
                    contratos com demais fornecedores e colaboradores,
                    propriedades, empréstimos e demais financiamentos legais,
                    área contenciosa e demais aspectos jurídicos que possam
                    interferir nos negócios ou diminuir o valor de mercado.
                  </p>
                </div>
                <div className="space-y-2 mt-4 bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-purple-600" />
                    Cultura de Compliance
                  </h4>
                  <p>
                    É na due diligence jurídica também que se analisam aspectos
                    de compliance dentro da cultura da empresa. Isto é,
                    verifica-se se a empresa criou uma cultura de procedimentos
                    internos e externos que estejam de acordo com a vigência
                    legal da atividade desempenhada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
