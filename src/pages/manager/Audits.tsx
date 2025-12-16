import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Audits() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Auditorias e Monitoramento</h1>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Auditorias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações Corretivas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>10/11/2023</TableCell>
                <TableCell>Interna - Financeira</TableCell>
                <TableCell>Auditoria Geral</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Concluída
                  </Badge>
                </TableCell>
                <TableCell>0 pendentes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>05/12/2023</TableCell>
                <TableCell>Externa - Compliance</TableCell>
                <TableCell>Empresa X</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700"
                  >
                    Em Análise
                  </Badge>
                </TableCell>
                <TableCell>2 pendentes</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
