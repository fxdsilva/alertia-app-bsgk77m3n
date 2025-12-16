import { useState, useEffect } from 'react'
import useAppStore from '@/stores/useAppStore'
import { adminService } from '@/services/adminService'
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
import { toast } from 'sonner'
import { Shield, Trash2 } from 'lucide-react'

export default function CommitmentManager() {
  const { selectedSchool } = useAppStore()
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')

  const fetchDoc = async () => {
    if (!selectedSchool) return
    try {
      const doc = await adminService.getCommitment(selectedSchool.id)
      setDocument(doc)
      if (doc) setDescription(doc.descricao || '')
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchDoc()
  }, [selectedSchool])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool || !file) return
    setLoading(true)
    try {
      await adminService.upsertCommitment(selectedSchool.id, file, description)
      toast.success('Documento salvo com sucesso')
      setFile(null)
      fetchDoc()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar documento')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!document) return
    setLoading(true)
    try {
      await adminService.updateCommitmentDescription(document.id, description)
      toast.success('Descrição atualizada')
      fetchDoc()
    } catch (error) {
      toast.error('Erro ao atualizar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!document) return
    if (!confirm('Tem certeza que deseja excluir este documento?')) return
    setLoading(true)
    try {
      await adminService.deleteCommitment(document.id)
      toast.success('Documento excluído')
      setDocument(null)
      setDescription('')
    } catch (error) {
      toast.error('Erro ao excluir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Gestão: Compromisso da Alta Gestão</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documento Atual</CardTitle>
            <CardDescription>Visualize o documento vigente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {document ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 border rounded bg-muted/20">
                  <Shield className="h-6 w-6 text-primary" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">Compromisso Vigente</p>
                    <a
                      href={document.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Visualizar PDF
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição Atual</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdate}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      Atualizar Descrição
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Nenhum documento cadastrado.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {document ? 'Substituir Documento' : 'Novo Documento'}
            </CardTitle>
            <CardDescription>
              Faça upload de um novo arquivo PDF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo PDF</Label>
                <Input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required={!document}
                />
              </div>

              {!document && (
                <div className="space-y-2">
                  <Label htmlFor="desc">Descrição (Opcional)</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Compromisso firmado em..."
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={!file || loading}
                className="w-full"
              >
                {loading
                  ? 'Enviando...'
                  : document
                    ? 'Substituir Arquivo'
                    : 'Enviar Documento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
