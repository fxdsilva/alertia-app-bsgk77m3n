import { useState, useEffect } from 'react'
import {
  Building2,
  FileText,
  Award,
  Landmark,
  Handshake,
  Download,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import {
  partnersService,
  Partner,
  PartnerDocument,
} from '@/services/partnersService'

export default function Partners() {
  const { profile } = useAppStore()
  const isSenior =
    profile === 'senior' ||
    profile === 'administrador' ||
    profile === 'admin_gestor'
  const { toast } = useToast()

  const [partners, setPartners] = useState<Partner[]>([])
  const [documents, setDocuments] = useState<PartnerDocument[]>([])
  const [loading, setLoading] = useState(true)

  // Partner Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)

  // Form State
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<'parceiro' | 'patrocinador' | 'apoio'>(
    'parceiro',
  )
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pData, dData] = await Promise.all([
        partnersService.getPartners(),
        partnersService.getDocuments(),
      ])
      setPartners(pData)
      setDocuments(dData)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenModal = (p?: Partner) => {
    if (p) {
      setEditingPartner(p)
      setNome(p.nome)
      setTipo(p.tipo)
      setCategoria(p.categoria || '')
      setDescricao(p.descricao || '')
      setLinkUrl(p.link_url || '')
    } else {
      setEditingPartner(null)
      setNome('')
      setTipo('parceiro')
      setCategoria('')
      setDescricao('')
      setLinkUrl('')
    }
    setLogoFile(null)
    setIsModalOpen(true)
  }

  const handleSavePartner = async () => {
    if (!nome.trim())
      return toast({ title: 'O nome é obrigatório', variant: 'destructive' })
    try {
      setIsSubmitting(true)
      let logo_url = editingPartner?.logo_url || null
      if (logoFile) {
        logo_url = await partnersService.uploadLogo(logoFile)
      }

      const payload = {
        nome,
        tipo,
        categoria,
        descricao,
        link_url: linkUrl,
        logo_url,
      }

      if (editingPartner) {
        await partnersService.updatePartner(editingPartner.id, payload)
        toast({ title: 'Parceiro atualizado' })
      } else {
        await partnersService.addPartner(payload)
        toast({ title: 'Parceiro adicionado' })
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm('Deseja realmente remover esta instituição?')) return
    try {
      await partnersService.deletePartner(id)
      toast({ title: 'Removido com sucesso' })
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const parceiros = partners.filter((p) => p.tipo === 'parceiro')
  const patrocinadores = partners.filter((p) => p.tipo === 'patrocinador')
  const apoios = partners.filter((p) => p.tipo === 'apoio')

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl relative">
          <Badge className="mb-4" variant="secondary">
            Rede de Confiança
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Instituições Parceiras
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Acreditamos que a integridade e a transparência se fortalecem com o
            apoio mútuo. Nossa rede de parceiros institucionais reflete nosso
            compromisso com a excelência e as melhores práticas no ambiente
            educacional.
          </p>

          {isSenior && (
            <div className="absolute top-0 right-0 mt-4 md:mt-0 flex gap-2">
              <Button
                onClick={() => handleOpenModal()}
                className="gap-2 shadow-lg"
              >
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="container mx-auto px-4 space-y-20 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
                <Landmark className="h-6 w-6 text-primary" />
                Apoio Institucional e Governamental
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {apoios.length === 0 && (
                  <p className="text-muted-foreground text-sm col-span-full">
                    Nenhum apoio cadastrado.
                  </p>
                )}
                {apoios.map((gov) => (
                  <Card
                    key={gov.id}
                    className="border-none shadow-none bg-secondary/30 flex flex-col items-center justify-center p-6 hover:bg-secondary/50 transition-colors relative group"
                  >
                    {isSenior && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 rounded-md p-1 backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleOpenModal(gov)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleDeletePartner(gov.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {gov.logo_url ? (
                      <img
                        src={gov.logo_url}
                        alt={gov.nome}
                        className="w-16 h-16 mb-4 object-contain opacity-80"
                      />
                    ) : (
                      <Landmark className="w-12 h-12 mb-4 text-muted-foreground/30" />
                    )}
                    <span className="text-sm font-medium text-center text-muted-foreground">
                      {gov.nome}
                    </span>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Patrocinadores
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {patrocinadores.length === 0 && (
                  <p className="text-muted-foreground text-sm col-span-full">
                    Nenhum patrocinador cadastrado.
                  </p>
                )}
                {patrocinadores.map((sponsor) => (
                  <Card
                    key={sponsor.id}
                    className="border-none shadow-none bg-secondary/30 flex flex-col items-center justify-center p-6 hover:bg-secondary/50 transition-colors relative group"
                  >
                    {isSenior && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 rounded-md p-1 backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleOpenModal(sponsor)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleDeletePartner(sponsor.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.nome}
                        className="w-16 h-16 mb-4 object-contain opacity-80"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 mb-4 text-muted-foreground/30" />
                    )}
                    <span className="text-sm font-medium text-center text-muted-foreground">
                      {sponsor.nome}
                    </span>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold flex items-center justify-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                Rede de Escolas e Instituições
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Organizações que compartilham nossos valores e participam
                ativamente da nossa rede de integridade educacional.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {parceiros.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">
                  Nenhuma instituição parceira cadastrada.
                </div>
              )}
              {parceiros.map((partner) => (
                <Card
                  key={partner.id}
                  className="hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  {isSenior && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 rounded-md p-1 backdrop-blur-sm z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleOpenModal(partner)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDeletePartner(partner.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.nome}
                        className="w-12 h-12 mb-4 object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-12 h-12 mb-4 bg-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {partner.nome}
                    </h3>
                    {partner.categoria && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {partner.categoria}
                      </p>
                    )}
                    {partner.link_url && (
                      <a
                        href={partner.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        Visitar site <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="bg-secondary/20 -mx-4 px-4 py-16 md:-mx-8 md:px-8 rounded-3xl">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 relative">
                <h2 className="text-3xl font-semibold flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  Certificados e Termos de Cooperação
                </h2>
                <p className="text-muted-foreground mt-4">
                  Transparência é um de nossos pilares. Acesse os documentos
                  oficiais que firmam nossas parcerias.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {documents.length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground">
                    Nenhum documento disponível no momento.
                  </div>
                )}
                {documents.map((doc) => {
                  const Icon = doc.tipo === 'Certificado' ? Award : Handshake
                  return (
                    <Card
                      key={doc.id}
                      className="flex flex-row items-center p-4 hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <div className="bg-primary/10 p-3 rounded-full mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm md:text-base leading-tight">
                          {doc.titulo}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase"
                          >
                            {doc.tipo}
                          </Badge>
                          {doc.data_documento && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(doc.data_documento).toLocaleDateString(
                                'pt-BR',
                                { month: 'short', year: 'numeric' },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={doc.arquivo_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground group-hover:text-primary"
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                      </a>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? 'Editar Instituição' : 'Nova Instituição'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da instituição para exibi-la na página pública.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Instituto Educar"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Parceria</Label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parceiro">Instituição Parceira</SelectItem>
                  <SelectItem value="patrocinador">Patrocinador</SelectItem>
                  <SelectItem value="apoio">
                    Apoio Institucional / Governo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: ONG, Universidade, EdTech"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">Link do Site</Label>
              <Input
                id="link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo (Imagem)</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              {editingPartner?.logo_url && !logoFile && (
                <span className="text-xs text-muted-foreground">
                  Imagem atual carregada. Selecione outra para substituir.
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição Breve</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="Breve sobre a instituição..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePartner} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
