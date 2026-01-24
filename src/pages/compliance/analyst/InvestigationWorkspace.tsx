import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, FileText, Scale, Gavel, Save } from 'lucide-react'
import { toast } from 'sonner'
import { complianceService } from '@/services/complianceService'

export default function InvestigationWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [report, setReport] = useState('')
  const [mediation, setMediation] = useState('')
  const [disciplinary, setDisciplinary] = useState('')

  useEffect(() => {
    if (id) fetchInvestigation()
  }, [id])

  const fetchInvestigation = async () => {
    setLoading(true)
    try {
      const inv = await complianceService.getInvestigation(id!)
      setData(inv)
      setReport(inv.resultado || '')
      // In a real app, mediation and disciplinary would be separate tables or JSON fields
      // For simplicity, assuming they are part of result or separate fields if schema supported
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar investigação')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await complianceService.updateInvestigation(id!, {
        resultado: report,
        // update other fields as needed
      })
      toast.success('Progresso salvo com sucesso')
    } catch (error) {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 p-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/compliance/analyst/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Workspace de Investigação</h1>
          <p className="text-muted-foreground">
            Protocolo: {data.denuncias?.protocolo}
          </p>
        </div>
        <div className="ml-auto">
          <Badge
            variant="outline"
            className="text-lg px-4 py-1 bg-yellow-100 text-yellow-800"
          >
            {data.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Detalhes da Denúncia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Escola
              </p>
              <p>{data.escolas_instituicoes?.nome_escola}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Descrição
              </p>
              <div className="bg-muted p-3 rounded-md text-sm mt-1 whitespace-pre-wrap">
                {data.denuncias?.descricao}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Data de Abertura
              </p>
              <p>{new Date(data.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de Trabalho</CardTitle>
            <CardDescription>
              Registre o progresso da investigação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="report" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="report" className="gap-2">
                  <FileText className="h-4 w-4" /> Relatório Técnico
                </TabsTrigger>
                <TabsTrigger value="mediation" className="gap-2">
                  <Scale className="h-4 w-4" /> Mediação
                </TabsTrigger>
                <TabsTrigger value="disciplinary" className="gap-2">
                  <Gavel className="h-4 w-4" /> Medidas Disciplinares
                </TabsTrigger>
              </TabsList>

              <TabsContent value="report" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Parecer Técnico</h3>
                  <p className="text-sm text-muted-foreground">
                    Descreva os fatos apurados, evidências analisadas e
                    conclusão preliminar.
                  </p>
                  <Textarea
                    className="min-h-[300px]"
                    placeholder="Digite o relatório técnico..."
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="mediation" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Registro de Mediação</h3>
                  <p className="text-sm text-muted-foreground">
                    Caso haja mediação, registre a ata e os acordos firmados.
                  </p>
                  <Textarea
                    className="min-h-[300px]"
                    placeholder="Cole a ata de mediação aqui..."
                    value={mediation}
                    onChange={(e) => setMediation(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="disciplinary" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    Aplicação de Medidas Disciplinares
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Documente as sanções aplicadas conforme o regimento.
                  </p>
                  <Textarea
                    className="min-h-[300px]"
                    placeholder="Descreva as medidas disciplinares..."
                    value={disciplinary}
                    onChange={(e) => setDisciplinary(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="flex justify-end gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Progresso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
