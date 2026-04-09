import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Users,
  UserCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
      const { data, error } = await supabase.rpc(
        'get_complaint_tracking_details',
        { protocol_query: protocol },
      )

      if (error || !data) {
        setNotFound(true)
      } else {
        setResult({
          status: data.status,
          lastUpdate: format(
            new Date(data.lastUpdate),
            "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
            { locale: ptBR },
          ),
          hasMultipleAnalysts: data.hasMultipleAnalysts,
          teamDecision: data.teamDecision,
          leaderAgreed: data.leaderAgreed,
          directorDecision: data.directorDecision,
          totalAnalysts: data.totalAnalysts,
          message:
            'Acompanhe as atualizações periodicamente. Para mais detalhes, entre em contato com a instituição.',
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao consultar protocolo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-lg space-y-6 pt-10 pb-20 animate-fade-in">
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
        <div className="space-y-4 animate-fade-in-up">
          <Card className="border-l-4 border-l-primary">
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
            </CardContent>
          </Card>

          {/* Workflow Details */}
          <div className="grid gap-4">
            {result.hasMultipleAnalysts && result.teamDecision && (
              <Card>
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full mt-1 shrink-0">
                    <Users className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Análise da Equipe ({result.totalAnalysts} analistas)
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      A equipe concluiu a análise preliminar com a decisão de:{' '}
                      <strong className="text-slate-900">
                        {result.teamDecision}
                      </strong>
                      .
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      {result.leaderAgreed ? (
                        <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-md font-medium">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Líder da análise de acordo
                        </span>
                      ) : result.leaderAgreed === false ? (
                        <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-medium">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Decisão por maioria (Líder divergente)
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!result.hasMultipleAnalysts && result.teamDecision && (
              <Card>
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full mt-1 shrink-0">
                    <UserCheck className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Análise Técnica
                    </h4>
                    <p className="text-sm text-slate-600">
                      O analista responsável concluiu a avaliação como:{' '}
                      <strong className="text-slate-900">
                        {result.teamDecision}
                      </strong>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 flex items-start gap-4">
                <div
                  className={`p-2 rounded-full mt-1 shrink-0 ${result.directorDecision ? 'bg-primary/10' : 'bg-slate-100'}`}
                >
                  {result.directorDecision ? (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Decisão da Diretoria de Compliance
                  </h4>
                  {result.directorDecision ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        O Diretor de Compliance registrou uma decisão sobre este
                        caso.
                      </p>
                      <div className="bg-slate-50 p-3 rounded-md border text-sm text-slate-700">
                        <span className="block font-medium mb-1 text-slate-900">
                          Novo Status: {result.directorDecision.new_status}
                        </span>
                        {result.directorDecision.comments && (
                          <span className="block italic text-slate-600">
                            "{result.directorDecision.comments}"
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Registrado em{' '}
                        {format(
                          new Date(result.directorDecision.created_at),
                          'dd/MM/yyyy HH:mm',
                          { locale: ptBR },
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      Aguardando parecer final ou validação da Diretoria de
                      Compliance.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 p-4 rounded-md text-center mt-6">
            <p className="font-medium text-sm text-foreground">
              {result.message}
            </p>
          </div>
        </div>
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
