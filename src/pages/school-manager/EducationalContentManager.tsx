import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/useAppStore'
import { trainingService, Training } from '@/services/trainingService'
import { toast } from 'sonner'

export default function EducationalContentManager() {
  const { selectedSchool } = useAppStore()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Partial<Training>>({
    tipo_conteudo: 'link',
    ativo: true,
  })

  const [questions, setQuestions] = useState<
    { pergunta: string; opcoes: string[] }[]
  >([])

  useEffect(() => {
    if (selectedSchool) fetchTrainings()
  }, [selectedSchool])

  const fetchTrainings = async () => {
    if (!selectedSchool) return
    setLoading(true)
    try {
      const data = await trainingService.getTrainingsBySchool(selectedSchool.id)
      setTrainings(data)
    } catch (error) {
      toast.error('Erro ao carregar conteúdos')
    } finally {
      setLoading(false)
    }
  }

  const openDialog = (training?: Training) => {
    if (training) {
      setEditingTraining(training)
      setQuestions(training.questoes ? (training.questoes as any) : [])
    } else {
      setEditingTraining({
        tipo_conteudo: 'link',
        ativo: true,
        obrigatorio: false,
      })
      setQuestions([])
    }
    setIsDialogOpen(true)
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, { pergunta: '', opcoes: ['', '', '', ''] }])
  }

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const newQ = [...questions]
    newQ[index] = { ...newQ[index], [field]: value }
    setQuestions(newQ)
  }

  const handleUpdateOption = (
    qIndex: number,
    optIndex: number,
    value: string,
  ) => {
    const newQ = [...questions]
    newQ[qIndex].opcoes[optIndex] = value
    setQuestions(newQ)
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!selectedSchool || !editingTraining.titulo) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      const payload: Partial<Training> = {
        ...editingTraining,
        escola_id: selectedSchool.id,
        questoes:
          editingTraining.tipo_conteudo === 'questionario' ? questions : null,
      }

      await trainingService.upsertTraining(payload)
      toast.success('Conteúdo salvo com sucesso')
      setIsDialogOpen(false)
      fetchTrainings()
    } catch (error) {
      toast.error('Erro ao salvar conteúdo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este conteúdo?')) return
    try {
      await trainingService.deleteTraining(id)
      toast.success('Conteúdo excluído')
      fetchTrainings()
    } catch (error) {
      toast.error('Erro ao excluir conteúdo')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Conteúdo Educativo
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie cursos, materiais e questionários para os colaboradores.
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Conteúdo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trainings.map((t) => (
          <Card
            key={t.id}
            className="flex flex-col hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <div className="flex justify-between items-start">
                <Badge variant={t.obrigatorio ? 'destructive' : 'secondary'}>
                  {t.obrigatorio ? 'Obrigatório' : 'Opcional'}
                </Badge>
                <div className="flex gap-1">
                  {t.tipo_conteudo === 'pdf' ? (
                    <FileText className="h-4 w-4 text-orange-500" />
                  ) : t.tipo_conteudo === 'questionario' ? (
                    <HelpCircle className="h-4 w-4 text-purple-500" />
                  ) : (
                    <LinkIcon className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
              <CardTitle className="text-lg mt-2 line-clamp-2" title={t.titulo}>
                {t.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-4 flex flex-col justify-between">
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {t.descricao || 'Sem descrição'}
              </p>
              <div className="flex justify-end gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(t)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {trainings.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-slate-50">
            <p className="text-slate-500">Nenhum conteúdo cadastrado.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTraining.id
                ? 'Editar Conteúdo'
                : 'Novo Conteúdo Educativo'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={editingTraining.titulo || ''}
                onChange={(e) =>
                  setEditingTraining({
                    ...editingTraining,
                    titulo: e.target.value,
                  })
                }
                placeholder="Ex: Código de Conduta 2026"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={editingTraining.descricao || ''}
                onChange={(e) =>
                  setEditingTraining({
                    ...editingTraining,
                    descricao: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Conteúdo</Label>
                <Select
                  value={editingTraining.tipo_conteudo || 'link'}
                  onValueChange={(v) =>
                    setEditingTraining({ ...editingTraining, tipo_conteudo: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">
                      Link Externo (Vídeo/Curso)
                    </SelectItem>
                    <SelectItem value="pdf">Material em PDF</SelectItem>
                    <SelectItem value="questionario">Questionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Obrigatoriedade</Label>
                <Select
                  value={editingTraining.obrigatorio ? 'sim' : 'nao'}
                  onValueChange={(v) =>
                    setEditingTraining({
                      ...editingTraining,
                      obrigatorio: v === 'sim',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Obrigatório</SelectItem>
                    <SelectItem value="nao">Opcional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(editingTraining.tipo_conteudo === 'link' ||
              editingTraining.tipo_conteudo === 'pdf') && (
              <div className="space-y-2">
                <Label>URL do Arquivo ou Link *</Label>
                <Input
                  value={editingTraining.conteudo_url || ''}
                  onChange={(e) =>
                    setEditingTraining({
                      ...editingTraining,
                      conteudo_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>
            )}

            {editingTraining.tipo_conteudo === 'questionario' && (
              <div className="space-y-4 mt-6 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Questões</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddQuestion}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Questão
                  </Button>
                </div>

                {questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-4 border rounded-md bg-slate-50 space-y-3 relative"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 h-8 w-8 p-0"
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="space-y-1.5 pr-10">
                      <Label className="text-xs">Pergunta {qIndex + 1}</Label>
                      <Input
                        value={q.pergunta}
                        onChange={(e) =>
                          handleUpdateQuestion(
                            qIndex,
                            'pergunta',
                            e.target.value,
                          )
                        }
                        placeholder="Qual é a política sobre..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {q.opcoes.map((opt, optIndex) => (
                        <Input
                          key={optIndex}
                          value={opt}
                          onChange={(e) =>
                            handleUpdateOption(qIndex, optIndex, e.target.value)
                          }
                          placeholder={`Opção ${optIndex + 1}`}
                          className="text-sm"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Conteúdo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
