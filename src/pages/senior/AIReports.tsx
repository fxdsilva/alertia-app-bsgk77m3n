import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Download, Loader2, Calendar, Trash2 } from 'lucide-react'
import { AIReportGenerator } from '@/components/dashboard/AIReportGenerator'
import { aiReportService } from '@/services/aiReportService'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { getPdfHtml } from '@/lib/pdf-templates'

export default function AIReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await aiReportService.getReports(12)
      setReports(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await aiReportService.deleteReport(id)
      toast.success('Relatório excluído com sucesso')
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir o relatório')
    }
  }

  const exportToPDF = (report: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = getPdfHtml(report)
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Sparkles className="text-indigo-500 h-6 w-6" />
            Relatórios Estratégicos (IA)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gere e exporte análises inteligentes baseadas nos dados de
            compliance.
          </p>
        </div>
        <AIReportGenerator onReportGenerated={loadReports} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-white rounded-lg border border-dashed">
            <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">
              Nenhum relatório gerado ainda.
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Utilize o botão acima para iniciar sua primeira análise.
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <Card
              key={report.id}
              className="flex flex-col hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {report.tipo}
                  </span>

                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-indigo-400 mr-2" />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir Relatório?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O relatório será
                            removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(report.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardTitle
                  className="text-lg leading-tight line-clamp-2"
                  title={report.titulo}
                >
                  {report.titulo}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(report.data_geracao).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 line-clamp-3">
                  {report.conteudo_json?.summary}
                </p>
                {report.escolas_instituicoes?.nome_escola && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                      Escola: {report.escolas_instituicoes.nome_escola}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6">
                <Button
                  variant="outline"
                  className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                  onClick={() => exportToPDF(report)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
