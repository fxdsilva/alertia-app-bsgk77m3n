import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

export default function ComplaintStatus() {
  const [protocol, setProtocol] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSearch = () => {
    if (!protocol) {
      toast.error('Digite o número do protocolo.')
      return
    }
    // Mock result
    setResult({
      status: 'Em Investigação',
      lastUpdate: '2023-12-16',
      message:
        'O comitê de ética iniciou a análise das evidências apresentadas.',
    })
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 pt-10">
      <h1 className="text-2xl font-bold text-center">Acompanhar Denúncia</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consulte pelo Protocolo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: PRT-123456"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-fade-in-up border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>
              Status: <span className="text-primary">{result.status}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Última atualização: {result.lastUpdate}
            </p>
            <p className="font-medium">{result.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
