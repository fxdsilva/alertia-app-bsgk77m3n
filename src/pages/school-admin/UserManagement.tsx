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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import useAppStore from '@/stores/useAppStore'
import { schoolAdminService, SchoolUser } from '@/services/schoolAdminService'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { useNavigate } from 'react-router-dom'

export default function UserManagement() {
  const { selectedSchool, user } = useAppStore()
  const navigate = useNavigate()
  const [users, setUsers] = useState<SchoolUser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin_gestor') {
      navigate('/')
      return
    }
    fetchUsers()
  }, [selectedSchool, user])

  const fetchUsers = async () => {
    if (!selectedSchool) return
    setLoading(true)
    try {
      const data = await schoolAdminService.getUsers(selectedSchool.id)
      setUsers(data)
    } catch (error) {
      toast.error('Erro ao carregar usuários')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: SchoolUser) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      )
    )
      return

    setActionLoading(true)
    try {
      await schoolAdminService.deleteUser(id)
      toast.success('Usuário excluído com sucesso')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    if (!selectedSchool) return
    setActionLoading(true)
    try {
      if (editingUser) {
        await schoolAdminService.updateUser(editingUser.id, {
          nome_usuario: values.nome,
          perfil: values.perfil,
          ativo: values.ativo,
        })
        toast.success('Usuário atualizado')
      } else {
        await schoolAdminService.createUser({
          email: values.email,
          password: values.password,
          nome: values.nome,
          perfil: values.perfil,
          escola_id: selectedSchool.id,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie o acesso à plataforma da {selectedSchool?.name}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.nome_usuario}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">
                    {u.perfil.replace('_', ' ')}
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(u)}
                        disabled={actionLoading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(u.id)}
                        disabled={actionLoading || u.id === user?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
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

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingUser}
        loading={actionLoading}
      />
    </div>
  )
}
