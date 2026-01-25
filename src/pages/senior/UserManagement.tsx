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
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Search, Loader2, Pencil, Users } from 'lucide-react'
import { toast } from 'sonner'
import useAppStore from '@/stores/useAppStore'
import { seniorUserService, SeniorUser } from '@/services/seniorUserService'
import { SeniorUserFormDialog } from '@/components/users/SeniorUserFormDialog'
import { useNavigate } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function UserManagement() {
  const { profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [users, setUsers] = useState<SeniorUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProfile, setFilterProfile] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SeniorUser | null>(null)
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

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    try {
      await seniorUserService.toggleUserStatus(id, newStatus)
      setUsers(users.map((u) => (u.id === id ? { ...u, ativo: newStatus } : u)))
      toast.success(
        `Usuário ${newStatus ? 'ativado' : 'inativado'} com sucesso`,
      )
    } catch (error: any) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: SeniorUser) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: any) => {
    setActionLoading(true)
    try {
      if (editingUser) {
        await seniorUserService.updateUser(editingUser.id, {
          nome_usuario: values.nome,
          email: values.email,
          perfil: values.perfil,
          escola_id: values.escola_id,
          ativo: values.ativo,
          cargo: values.cargo,
          departamento: values.departamento,
        })
        toast.success('Usuário atualizado com sucesso')
      } else {
        await seniorUserService.createUser({
          ...values,
          nome: values.nome,
        })
        toast.success('Usuário criado com sucesso')
      }
      setDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nome_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProfile = filterProfile === 'all' || u.perfil === filterProfile

    return matchesSearch && matchesProfile
  })

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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestão Global de Usuários
          </h1>
          <p className="text-muted-foreground">
            Administre perfis, permissões e status de acesso de todos os
            usuários.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterProfile} onValueChange={setFilterProfile}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Perfis</SelectItem>
            <SelectItem value="DIRETOR_COMPLIANCE">
              Diretor Compliance
            </SelectItem>
            <SelectItem value="ANALISTA_COMPLIANCE">
              Analista Compliance
            </SelectItem>
            <SelectItem value="gestor">Gestor</SelectItem>
            <SelectItem value="gestao_escola">Gestão Escolar</SelectItem>
            <SelectItem value="colaborador">Colaborador</SelectItem>
            <SelectItem value="professor">Professor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Registrados ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Departamento</TableHead>
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
                    {u.cargo && (
                      <p className="text-xs text-muted-foreground">{u.cargo}</p>
                    )}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">
                    <Badge variant="outline">
                      {u.perfil.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.departamento || '-'}</TableCell>
                  <TableCell>
                    {u.escolas_instituicoes?.nome_escola || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.ativo}
                        onCheckedChange={() =>
                          handleStatusToggle(u.id, u.ativo)
                        }
                        aria-label="Toggle status"
                      />
                      <span className="text-xs text-muted-foreground">
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(u)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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
                    colSpan={7}
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
        initialData={editingUser}
      />
    </div>
  )
}
