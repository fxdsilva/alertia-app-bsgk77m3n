import { useEffect, useState } from 'react'
import useAppStore from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { portalService, DocumentRecord } from '@/services/portalService'
import { toast } from 'sonner'

export default function ManagementCommitment() {
  const { selectedSchool } = useAppStore()
  const navigate = useNavigate()
  const [document, setDocument] = useState<DocumentRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedSchool) {
      navigate('/')
      return
    }

    const fetchDoc = async () => {
      try {
        const doc = await portalService.getManagementCommitment(
          selectedSchool.id,
        )
        setDocument(doc)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar o Compromisso da Alta Gestão.')
      } finally {
        setLoading(false)
      }
    }

    fetchDoc()
  }, [selectedSchool, navigate])

  return (
    <div className="container mx-auto max-w-4xl space-y-6 animate-fade-in py-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/public/portal')}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </Button>
        <h1 className="text-3xl font-bold text-primary">
          Compromisso da Alta Gestão
        </h1>
      </div>

      <Card className="min-h-[60vh]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Documento Oficial
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : document ? (
            <div className="w-full h-[800px]">
              <iframe
                src={document.arquivo_url}
                className="w-full h-full rounded-md border"
                title="Compromisso da Alta Gestão"
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-4">
                O Termo de Compromisso ainda não foi disponibilizado por esta
                instituição.
              </p>
              <p className="text-sm">
                Entre em contato com a administração da {selectedSchool?.name}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
