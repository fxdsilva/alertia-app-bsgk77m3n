import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { schools as initialSchools } from '@/lib/mockData'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function SchoolManagement() {
  const [schools, setSchools] = useState(initialSchools)

  const toggleStatus = (id: string) => {
    setSchools(
      schools.map((s) => {
        if (s.id === id) {
          const newStatus = s.status === 'ativo' ? 'inativo' : 'ativo'
          toast.success(`Status da escola ${s.name} alterado para ${newStatus}`)
          return { ...s, status: newStatus }
        }
        return s
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Escolas</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar Escola
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Município/UF</TableHead>
                <TableHead>Rede</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>
                    {school.municipality}/{school.state}
                  </TableCell>
                  <TableCell>{school.network}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${school.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {school.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={school.status === 'ativo'}
                      onCheckedChange={() => toggleStatus(school.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
