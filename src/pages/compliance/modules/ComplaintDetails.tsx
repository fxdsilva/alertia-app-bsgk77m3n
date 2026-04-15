import { useParams, useNavigate } from 'react-router-dom'
import { useComplaint } from '@/hooks/useComplaints'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  FileWarning,
  ShieldAlert,
  User,
  Building,
} from 'lucide-react'
import { AttachmentList } from '@/components/complaints/AttachmentList'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ComplaintDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { complaint, loading, error } = useComplaint(id)

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[50vh]">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">
          Denúncia não encontrada ou sem permissão
        </h2>
        <p className="text-muted-foreground mb-6">
          Verifique se você tem acesso a esta denúncia.
        </p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Protocolo: {complaint.protocolo}
            </h1>
            <p className="text-sm text-muted-foreground">
              Registrada em{' '}
              {format(
                new Date(complaint.created_at),
                "dd 'de' MMMM 'de' yyyy, HH:mm",
                { locale: ptBR },
              )}
            </p>
          </div>
        </div>
        <Badge
          variant={complaint.status === 'pendente' ? 'secondary' : 'default'}
          className="text-sm px-3 py-1"
        >
          {complaint.status_nome || complaint.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileWarning className="mr-2 h-5 w-5" />
                Relato da Denúncia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-md border text-sm leading-relaxed whitespace-pre-wrap">
                {complaint.descricao}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anexos e Evidências</CardTitle>
              <CardDescription>
                Documentos e arquivos enviados para análise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttachmentList attachments={complaint.attachments} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes da Ocorrência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Escola / Instituição
                </span>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    {complaint.escola_nome || 'Não informada'}
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Gravidade
                </span>
                <Badge
                  variant={
                    complaint.gravidade === 'Alta' ? 'destructive' : 'secondary'
                  }
                >
                  {complaint.gravidade || 'Não classificada'}
                </Badge>
              </div>
              <Separator />
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Categorias
                </span>
                <div className="flex flex-wrap gap-2">
                  {complaint.categoria && complaint.categoria.length > 0 ? (
                    complaint.categoria.map((cat, i) => (
                      <Badge key={i} variant="outline">
                        {cat}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm">Não categorizada</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Denunciante</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.anonimo ? (
                <div className="flex items-center text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Denúncia Anônima</span>
                </div>
              ) : (
                <div className="space-y-3 bg-muted/30 p-4 rounded-md border">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block">
                      Nome
                    </span>
                    <span className="text-sm font-medium">
                      {complaint.denunciante_nome || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block">
                      Vínculo
                    </span>
                    <span className="text-sm">
                      {complaint.denunciante_vinculo || 'Não informado'}
                    </span>
                  </div>
                  {(complaint.denunciante_email ||
                    complaint.denunciante_telefone) && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-xs font-medium text-muted-foreground block mb-1">
                        Contato
                      </span>
                      {complaint.denunciante_email && (
                        <span className="text-sm block truncate">
                          {complaint.denunciante_email}
                        </span>
                      )}
                      {complaint.denunciante_telefone && (
                        <span className="text-sm block">
                          {complaint.denunciante_telefone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
