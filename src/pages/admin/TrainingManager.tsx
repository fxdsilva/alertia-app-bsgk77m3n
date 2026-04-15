import { useState, useEffect } from 'react'
import useAppStore from '@/stores/useAppStore'
import { trainingService, Training } from '@/services/trainingService'
import { complianceService } from '@/services/complianceService'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { BookOpen, Trash2, Edit, Loader2, AlertTriangle } from 'lucide-react'
import { TrainingLayout } from '@/components/trainings/TrainingLayout'

export default function TrainingManager() {
  const { selectedSchool, user, profile } = useAppStore()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [checkingPermission, setCheckingPermission] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Training>>({
    titulo: '',
    descricao: '',
    conteudo_url: '',
    obrigatorio: false,
    ativo: true,
  })

  const fetchTrainings = async () => {
    if (!selectedSchool) return
    setLoading(true)
    try {
      const data = await trainingService.getTrainingsBySchool(selectedSchool.id)
      setTrainings(data || [])
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar treinamentos')
    } finally {
      setLoading(false)
    }
  }

  const checkPermissions = async () => {
    if (!user || !selectedSchool) {
      setCanEdit(false)
      setCheckingPermission(false)
      return
    }

    try {
      if (
        ['gestao_escola', 'administrador', 'admin_gestor', 'senior'].includes(
          profile || '',
        )
      ) {
        setCanEdit(true)
      } else {
        const hasPermission = await complianceService.hasSchoolDocPermission(
          user.id,
          selectedSchool.id,
        )
        setCanEdit(hasPermission)
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setCanEdit(false)
    } finally {
      setCheckingPermission(false)
    }
  }

  useEffect(() => {
    if (selectedSchool && user) {
      fetchTrainings()
      checkPermissions()
    }
  }, [selectedSchool, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return
    setLoading(true)
    try {
      await trainingService.upsertTraining({
        ...formData,
        escola_id: selectedSchool.id,
      })
      toast.success('Treinamento salvo com sucesso')
      setFormData({
        titulo: '',
        descricao: '',
        conteudo_url: '',
        obrigatorio: false,
        ativo: true,
      })
      setIsEditing(false)
      fetchTrainings()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar treinamento')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (t: Training) => {
    setFormData(t)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este treinamento?')) return
    setLoading(true)
    try {
      await trainingService.deleteTraining(id)
      toast.success('Treinamento excluído')
      fetchTrainings()
    } catch (error) {
      toast.error('Erro ao excluir')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      conteudo_url: '',
      obrigatorio: false,
      ativo: true,
    })
    setIsEditing(false)
  }

  if (checkingPermission) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <TrainingLayout
      title="Gestão de Treinamentos"
      description="Crie e gerencie os treinamentos da instituição."
    >
      <div className="flex items-center justify-end mb-4">
        {!canEdit && (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Modo Somente Leitura</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={!canEdit ? 'opacity-70 pointer-events-none' : ''}>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Editar Treinamento' : 'Novo Treinamento'}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Atualize as informações do treinamento.'
                : 'Cadastre um novo treinamento para a escola.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  required
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conteudo_url">Link do Conteúdo (URL)</Label>
                <Input
                  id="conteudo_url"
                  type="url"
                  value={formData.conteudo_url || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, conteudo_url: e.target.value })
                  }
                  placeholder="https://..."
                  disabled={!canEdit}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Obrigatório</Label>
                  <p className="text-xs text-muted-foreground">
                    O treinamento será exigido para os colaboradores.
                  </p>
                </div>
                <Checkbox
                  checked={formData.obrigatorio || false}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      obrigatorio: checked as boolean,
                    })
                  }
                  disabled={!canEdit}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Ativo</Label>
                  <p className="text-xs text-muted-foreground">
                    O treinamento ficará visível no catálogo.
                  </p>
                </div>
                <Checkbox
                  checked={formData.ativo || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ativo: checked as boolean })
                  }
                  disabled={!canEdit}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={loading || !canEdit || !formData.titulo}
                  className="flex-1"
                >
                  {loading
                    ? 'Salvando...'
                    : isEditing
                      ? 'Atualizar'
                      : 'Cadastrar'}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading || !canEdit}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treinamentos Cadastrados</CardTitle>
            <CardDescription>
              Gerencie os treinamentos da escola.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trainings.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {trainings.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col p-4 border rounded bg-muted/20 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold leading-none">
                          {t.titulo}
                        </h4>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(t)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {t.descricao && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {t.descricao}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap text-xs">
                      {t.obrigatorio ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                          Obrigatório
                        </span>
                      ) : (
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          Opcional
                        </span>
                      )}
                      {t.ativo ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Ativo
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Nenhum treinamento cadastrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TrainingLayout>
  )
}
