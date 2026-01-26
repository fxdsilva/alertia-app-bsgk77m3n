import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { portalService } from '@/services/portalService'

export default function ComplaintStatus() {
  const navigate = useNavigate()
  const [protocol, setProtocol] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = async () => {
    if (!protocol) {
      toast.error('Digite o número do protocolo.')
      return
    }
    setLoading(true)
    setResult(null)
    setNotFound(false)
    try {
      const data = await portalService.getComplaintStatus(protocol)
      if (data) {
        setResult({
          status: data.status,
          lastUpdate: new Date(data.updated_at).toLocaleDateString(),
          message:
            'Acompanhe as atualizações periodicamente. Para mais detalhes, entre em contato com a instituição.',
        })
      } else {
        setNotFound(true)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao consultar protocolo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 pt-10 pb-20 animate-fade-in">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-slate-900 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Início
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-center">Acompanhar Denúncia</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consulte pelo Protocolo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: 20231216-123456"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-fade-in-up border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Situação atual:
              </span>
              <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-base font-semibold text-primary">
                {result.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Última atualização: {result.lastUpdate}
            </p>
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="font-medium text-sm text-foreground">
                {result.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {notFound && (
        <Card className="animate-fade-in-up border-l-4 border-l-destructive bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-6 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <p className="font-medium">Protocolo não encontrado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
