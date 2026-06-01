import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import {
  Loader2,
  Filter,
  BrainCircuit,
  FileText,
  Trash2,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { aiReportService } from '@/services/aiReportService'
import { getPdfHtml } from '@/lib/pdf-templates'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'

export default function AIReports() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [denuncias, setDenuncias] = useState<any[]>([])
  const [escolas, setEscolas] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])

  // Filters
  const [schoolId, setSchoolId] = useState('all')
  const [categoria, setCategoria] = useState('all')
  const [vitimaFuncao, setVitimaFuncao] = useState('all')
  const [autorVinculo, setAutorVinculo] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resDenuncias, resEscolas, resReports] = await Promise.all([
        supabase
          .from('denuncias')
          .select(
            'id, escola_id, categoria, descricao, anonimo, envolvidos_detalhes, status, created_at',
          ),
        supabase
          .from('escolas_instituicoes')
          .select('id, nome_escola')
          .eq('ativo', true),
        aiReportService.getReports(10),
      ])

      if (resDenuncias.error) throw resDenuncias.error
      if (resEscolas.error) throw resEscolas.error

      setDenuncias(resDenuncias.data || [])
      setEscolas(resEscolas.data || [])
      setReports(resReports || [])
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Extract unique options
  const filterOptions = useMemo(() => {
    const cats = new Set<string>()
    const vitimas = new Set<string>()
    const autores = new Set<string>()

    denuncias.forEach((d) => {
      d.categoria?.forEach((c: string) => cats.add(c))
      const env = d.envolvidos_detalhes as any
      if (env) {
        if (env.vitima_funcao || env.victimProfile)
          vitimas.add(env.vitima_funcao || env.victimProfile)
        if (env.autor_vinculo || env.authorProfile)
          autores.add(env.autor_vinculo || env.authorProfile)
      }
    })

    return {
      categorias: Array.from(cats).filter(Boolean),
      vitimas: Array.from(vitimas).filter(Boolean),
      autores: Array.from(autores).filter(Boolean),
    }
  }, [denuncias])

  // Apply filters
  const filteredDenuncias = useMemo(() => {
    return denuncias.filter((d) => {
      const matchSchool = schoolId === 'all' || d.escola_id === schoolId
      const matchCat =
        categoria === 'all' || (d.categoria && d.categoria.includes(categoria))
      const env = (d.envolvidos_detalhes as any) || {}
      const matchVitima =
        vitimaFuncao === 'all' ||
        (env.vitima_funcao || env.victimProfile) === vitimaFuncao
      const matchAutor =
        autorVinculo === 'all' ||
        (env.autor_vinculo || env.authorProfile) === autorVinculo

      return matchSchool && matchCat && matchVitima && matchAutor
    })
  }, [denuncias, schoolId, categoria, vitimaFuncao, autorVinculo])

  // Analytics Computations
  const analytics = useMemo(() => {
    const total = filteredDenuncias.length
    const anônimas = filteredDenuncias.filter((d) => d.anonimo).length
    const identificadas = total - anônimas

    // Word Cloud
    const stopWords = [
      'o',
      'a',
      'os',
      'as',
      'um',
      'uma',
      'uns',
      'umas',
      'de',
      'do',
      'da',
      'dos',
      'das',
      'em',
      'no',
      'na',
      'nos',
      'nas',
      'que',
      'e',
      'é',
      'para',
      'por',
      'com',
      'como',
      'seu',
      'sua',
      'seus',
      'suas',
      'ao',
      'aos',
      'à',
      'às',
      'mas',
      'ou',
      'se',
      'nao',
      'não',
      'foi',
      'fui',
      'ser',
      'está',
      'esta',
      'são',
      'sao',
      'sobre',
      'isso',
      'esse',
      'essa',
      'esses',
      'essas',
      'este',
      'estes',
      'estas',
      'aquilo',
      'aquele',
      'aquela',
      'aqueles',
      'aquelas',
      'ele',
      'ela',
      'eles',
      'elas',
      'me',
      'te',
      'lhe',
      'nos',
      'vos',
      'mim',
      'ti',
      'si',
    ]
    const words = filteredDenuncias
      .map((d) => d.descricao || '')
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\sà-ú]/g, '')
      .split(/\s+/)
    const wordCounts: Record<string, number> = {}
    words.forEach((w) => {
      if (w.length > 3 && !stopWords.includes(w)) {
        wordCounts[w] = (wordCounts[w] || 0) + 1
      }
    })
    const wordCloud = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([text, value]) => ({ text, value }))

    return {
      total,
      anônimas,
      identificadas,
      anonymityData: [
        { name: 'Anônima', value: anônimas, fill: 'hsl(var(--warning))' },
        {
          name: 'Identificada',
          value: identificadas,
          fill: 'hsl(var(--primary))',
        },
      ],
      wordCloud,
    }
  }, [filteredDenuncias])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const newReport = await aiReportService.generateReport(
        schoolId === 'all' ? 'global' : 'school',
        schoolId !== 'all' ? schoolId : undefined,
        ['denuncias'],
        { categoria, vitimaFuncao, autorVinculo, schoolId },
      )
      toast({ title: 'Relatório gerado com sucesso' })
      setReports((prev) => [newReport, ...prev].slice(0, 10))
    } catch (err: any) {
      toast({
        title: 'Erro ao gerar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await aiReportService.deleteReport(id)
      setReports((prev) => prev.filter((r) => r.id !== id))
      toast({ title: 'Relatório excluído' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handlePrint = (report: any) => {
    const html = getPdfHtml(report)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)
    iframe.contentDocument?.write(html)
    iframe.contentDocument?.close()
    setTimeout(() => {
      iframe.contentWindow?.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }, 500)
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Relatórios IA & Estratégicos
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise linguística e cruzamento de dados com Inteligência
            Artificial
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="gap-2 shadow-md"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="h-4 w-4" />
          )}
          Gerar Análise IA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-4 bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-primary font-medium mr-2">
              <Filter className="h-4 w-4" /> Filtros Ativos
            </div>

            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger className="w-[200px] bg-background shadow-sm border-border/50">
                <SelectValue placeholder="Escola/Instituição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Instituições</SelectItem>
                {escolas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome_escola}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-[200px] bg-background shadow-sm border-border/50">
                <SelectValue placeholder="Categoria de Denúncia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {filterOptions.categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={vitimaFuncao} onValueChange={setVitimaFuncao}>
              <SelectTrigger className="w-[200px] bg-background shadow-sm border-border/50">
                <SelectValue placeholder="Função da Vítima" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Vítimas</SelectItem>
                {filterOptions.vitimas.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={autorVinculo} onValueChange={setAutorVinculo}>
              <SelectTrigger className="w-[200px] bg-background shadow-sm border-border/50">
                <SelectValue placeholder="Vínculo do Autor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Autores</SelectItem>
                {filterOptions.autores.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Volume da Amostra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {analytics.total}
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Registros correspondentes aos filtros
            </p>
          </CardContent>
        </Card>

        {/* Chart: Anonymity */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <PieChartIcon className="h-4 w-4" />
              Análise de Identificação vs Anonimato
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            {analytics.total > 0 ? (
              <ChartContainer
                config={{
                  Anônima: { label: 'Anônima', color: 'hsl(var(--warning))' },
                  Identificada: {
                    label: 'Identificada',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={analytics.anonymityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {analytics.anonymityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                Nenhum dado na amostra
              </div>
            )}
          </CardContent>
        </Card>

        {/* Word Cloud */}
        <Card className="md:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Cluster Linguístico (Temas Mencionados)
            </CardTitle>
            <CardDescription className="text-xs">
              Termos mais frequentes extraídos dos relatos na amostra atual
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[250px] flex items-center justify-center bg-secondary/10 rounded-xl m-6 border border-border/50 shadow-inner">
            {analytics.total > 0 ? (
              <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center items-center p-8 text-center max-w-5xl mx-auto">
                {analytics.wordCloud.map((w, i) => {
                  const maxVal = analytics.wordCloud[0].value
                  const minVal =
                    analytics.wordCloud[analytics.wordCloud.length - 1].value
                  const scale =
                    minVal === maxVal
                      ? 1
                      : (w.value - minVal) / (maxVal - minVal)
                  const size = 0.9 + scale * 2.2

                  return (
                    <span
                      key={i}
                      className="font-bold text-primary hover:text-primary/70 transition-all cursor-default"
                      style={{
                        fontSize: `${size}rem`,
                        opacity: 0.3 + scale * 0.7,
                        lineHeight: 1.2,
                        textShadow:
                          scale > 0.5 ? '0px 2px 4px rgba(0,0,0,0.1)' : 'none',
                      }}
                      title={`Ocorrências: ${w.value}`}
                    >
                      {w.text}
                    </span>
                  )
                })}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm font-medium">
                Nenhum texto para análise
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated Reports History */}
      <div className="pt-4">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Análises IA Salvas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.length > 0 ? (
            reports.map((r) => (
              <Card
                key={r.id}
                className="hover:border-primary/40 hover:shadow-md transition-all flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge
                      variant={
                        r.tipo === 'Análise de Rede' ? 'default' : 'outline'
                      }
                      className="font-semibold"
                    >
                      {r.tipo}
                    </Badge>
                    <div className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      {new Date(r.data_geracao).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <CardTitle
                    className="text-base leading-tight mt-3 line-clamp-2"
                    title={r.titulo}
                  >
                    {r.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 text-sm text-muted-foreground flex-1">
                  <div className="font-medium text-foreground/80 mb-2">
                    {r.escolas_instituicoes?.nome_escola || 'Rede Completa'}
                  </div>
                  <p className="line-clamp-4 text-sm leading-relaxed">
                    {r.conteudo_json?.summary}
                  </p>
                </CardContent>
                <CardFooter className="pt-3 flex justify-between border-t border-border/40 mt-auto bg-secondary/10 rounded-b-xl">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-3 transition-colors"
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-2 font-medium shadow-sm"
                    onClick={() => handlePrint(r)}
                  >
                    <FileText className="h-4 w-4" /> Visualizar PDF
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-10 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-xl bg-secondary/5">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BrainCircuit className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Nenhuma análise gerada
              </h3>
              <p className="text-sm max-w-sm text-center">
                Ajuste os filtros no painel superior e clique em "Gerar Análise
                IA" para iniciar uma nova extração de dados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
