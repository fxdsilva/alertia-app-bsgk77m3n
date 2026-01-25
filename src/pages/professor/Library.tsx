import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Shield, Download, Loader2, Info } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { portalService, DocumentRecord } from '@/services/portalService'
import { toast } from 'sonner'

export default function Library() {
  const { selectedSchool } = useAppStore()
  const [documents, setDocuments] = useState<{
    code: DocumentRecord | null
    commitment: DocumentRecord | null
  }>({ code: null, commitment: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedSchool) {
      fetchDocuments()
    }
  }, [selectedSchool])

  const fetchDocuments = async () => {
    if (!selectedSchool) return
    setLoading(true)
    try {
      const [code, commitment] = await Promise.all([
        portalService.getCodeOfConduct(selectedSchool.id),
        portalService.getManagementCommitment(selectedSchool.id),
      ])
      setDocuments({ code, commitment })
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar documentos.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (url: string) => {
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
        <p className="text-muted-foreground">
          Documentos institucionais e guias de conduta da {selectedSchool?.name}
          .
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Código de Conduta */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Código de Conduta</CardTitle>
            <CardDescription>Documento oficial de diretrizes.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {documents.code?.descricao ||
                'O código de conduta estabelece os padrões éticos e comportamentais esperados.'}
            </p>
          </CardContent>
          <CardFooter>
            {documents.code ? (
              <Button
                className="w-full gap-2"
                onClick={() => handleOpen(documents.code!.arquivo_url)}
              >
                <Download className="h-4 w-4" /> Baixar PDF
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full gap-2">
                <Info className="h-4 w-4" /> Não Disponível
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Compromisso de Gestão */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle>Compromisso de Gestão</CardTitle>
            <CardDescription>Termo de responsabilidade.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {documents.commitment?.descricao ||
                'Declaração de compromisso da alta gestão com a integridade e ética.'}
            </p>
          </CardContent>
          <CardFooter>
            {documents.commitment ? (
              <Button
                className="w-full gap-2"
                onClick={() => handleOpen(documents.commitment!.arquivo_url)}
              >
                <Download className="h-4 w-4" /> Baixar PDF
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full gap-2">
                <Info className="h-4 w-4" /> Não Disponível
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
