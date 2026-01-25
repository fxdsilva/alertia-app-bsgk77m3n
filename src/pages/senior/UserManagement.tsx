import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import useAppStore from '@/stores/useAppStore'
import { seniorUserService, SeniorUser } from '@/services/seniorUserService'
import { SeniorUserFormDialog } from '@/components/users/SeniorUserFormDialog'
import { useNavigate } from 'react-router-dom'

export default function UserManagement() {
  const { profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [users, setUsers] = useState<SeniorUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!appLoading && profile && profile !== 'senior') {
      navigate('/')
      return
    }
  }, [profile, appLoading, navigate])

  useEffect(() => {
    if (profile === 'senior') {
      fetchUsers()
    }
  }, [profile])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await seniorUserService.getAllUsers()
      setUsers(data)
    } catch (error) {
      toast.error('Erro ao carregar usuários')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      )
    )
      return

    try {
      await seniorUserService.deleteUser(id)
      toast.success('Usuário excluído com sucesso')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário')
    }
  }

  const handleSubmit = async (values: any) => {
    setActionLoading(true)
    try {
      await seniorUserService.createUser(values)
      toast.success('Usuário criado com sucesso')
      setDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.nome_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (appLoading || (loading && users.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão Global de Usuários</h1>
          <p className="text-muted-foreground">
            Administre todos os usuários registrados na plataforma.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Escola</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.nome_usuario}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">
                    <Badge variant="outline">
                      {u.perfil.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.escolas_instituicoes?.nome_escola || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.ativo ? 'default' : 'secondary'}
                      className={u.ativo ? 'bg-green-600' : 'bg-gray-400'}
                    >
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SeniorUserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        loading={actionLoading}
      />
    </div>
  )
}
