import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Loader2, UserCog, Mail, Shield, AlertCircle } from 'lucide-react'
import { complianceService } from '@/services/complianceService'
import { toast } from 'sonner'

interface Analyst {
  id: string
  nome_usuario: string
  email: string
  ativo: boolean
  escola_id?: string | null
}

export default function AnalystManagement() {
  const [analysts, setAnalysts] = useState<Analyst[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalysts()
  }, [])

  const fetchAnalysts = async () => {
    setLoading(true)
    try {
      const data = await complianceService.getAnalysts()
      setAnalysts(data as Analyst[])
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar lista de analistas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestão de Analistas
        </h1>
        <p className="text-muted-foreground">
          Visualização da equipe de Compliance e status de atividades.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Equipe Técnica
          </CardTitle>
          <CardDescription>
            Lista de analistas cadastrados na plataforma e seus status atuais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : analysts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
              <p>Nenhum analista encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vínculo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysts.map((analyst) => (
                  <TableRow key={analyst.id}>
                    <TableCell className="font-medium">
                      {analyst.nome_usuario}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {analyst.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={analyst.ativo ? 'default' : 'secondary'}
                        className={
                          analyst.ativo ? 'bg-green-600' : 'bg-gray-400'
                        }
                      >
                        {analyst.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {analyst.escola_id ? (
                        <span className="text-sm text-muted-foreground">
                          Escola Específica
                        </span>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <Shield className="h-3 w-3" /> Global
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
