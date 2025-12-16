import { useState, useEffect } from 'react'
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
import { Plus, Settings, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminService } from '@/services/adminService'
import { School } from '@/lib/mockData'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'

export default function SchoolManagement() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const { setSelectedSchool } = useAppStore()
  const navigate = useNavigate()

  const fetchSchools = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllSchools()
      setSchools(data)
    } catch (error) {
      toast.error('Erro ao carregar escolas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchools()
  }, [])

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo'
    try {
      await adminService.toggleSchoolStatus(id, newStatus)
      setSchools(
        schools.map((s) =>
          s.id === id ? { ...s, status: newStatus as any } : s,
        ),
      )
      toast.success('Status atualizado')
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleManageSchool = (school: School) => {
    setSelectedSchool(school)
    toast.success(`Gerenciando: ${school.name}`)
    navigate('/admin/dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
                  <TableCell className="text-right flex items-center justify-end gap-4">
                    <Switch
                      checked={school.status === 'ativo'}
                      onCheckedChange={() =>
                        toggleStatus(school.id, school.status)
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleManageSchool(school)}
                    >
                      <Settings className="h-4 w-4" /> Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {schools.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Nenhuma escola encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
