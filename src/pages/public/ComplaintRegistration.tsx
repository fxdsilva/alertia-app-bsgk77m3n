import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  ChevronsUpDown,
  Check,
  UploadCloud,
  X,
  AlertTriangle,
  ExternalLink,
  FileText,
  Shield,
  FileSearch,
  HelpCircle,
} from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { portalService, DocumentRecord } from '@/services/portalService'
import { School } from '@/lib/mockData'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const CATEGORY_GROUPS = [
  {
    heading: 'Violências contra estudantes',
    items: [
      'Bullying',
      'Cyberbullying',
      'Violência física',
      'Violência psicológica',
    ],
  },
  {
    heading: 'Assédio e abuso',
    items: ['Assédio moral', 'Assédio sexual', 'Abuso psicológico'],
  },
  {
    heading: 'Discriminação e preconceito',
    items: [
      'Racismo',
      'Intolerância religiosa',
      'LGBTfobia',
      'Capacitismo',
      'Machismo',
      'Xenofobia',
    ],
  },
  {
    heading: 'Outras Ocorrências',
    items: [
      'Violações de direitos educacionais',
      'Irregularidades administrativas e financeiras',
      'Violação ética e profissional',
      'Violência institucional',
      'Segurança e integridade física',
      'Outro',
    ],
  },
]

const ROLES = [
  'Aluno',
  'Professor',
  'Funcionário',
  'Coordenador',
  'Diretor',
  'Pai/Responsável',
  'Prestador de Serviço',
  'Comunidade',
  'Não sei informar',
  'Outro',
]

const complaintSchema = z.object({
  escola_id: z
    .string({ required_error: 'Selecione uma escola.' })
    .min(1, 'Selecione uma escola.'),
  categories: z
    .array(z.string())
    .min(1, 'Selecione pelo menos um tipo de ocorrência.'),
  // Victim
  vitima_funcao: z.string().min(1, 'Selecione a função da vítima.'),
  vitima_nome: z.string().optional(),
  vitima_setor: z.string().optional(),
  // Author
  autor_funcao: z.string().min(1, 'Selecione a função/vínculo do autor.'),
  autor_nome: z.string().optional(),
  autor_descricao: z.string().optional(),
  // Report
  description: z
    .string()
    .min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }),
  anonimo: z.boolean().default(true),
})

export default function ComplaintRegistration() {
  const [protocol, setProtocol] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [openSchool, setOpenSchool] = useState(false)
  const [openCategory, setOpenCategory] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  // Documents State
  const [documents, setDocuments] = useState<{
    code: DocumentRecord | null
    commitment: DocumentRecord | null
  }>({ code: null, commitment: null })
  const [loadingDocs, setLoadingDocs] = useState(false)

  const { selectedSchool, user } = useAppStore()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      escola_id: selectedSchool?.id || '',
      categories: [],
      description: '',
      anonimo: true,
      vitima_funcao: '',
      vitima_nome: '',
      vitima_setor: '',
      autor_funcao: '',
      autor_nome: '',
      autor_descricao: '',
    },
  })

  const selectedSchoolId = form.watch('escola_id')

  useEffect(() => {
    const fetchSchools = async () => {
      setLoadingSchools(true)
      try {
        const data = await portalService.getSchools()
        setSchools(data)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar lista de escolas.')
      } finally {
        setLoadingSchools(false)
      }
    }

    fetchSchools()
  }, [])

  useEffect(() => {
    if (selectedSchool) {
      form.setValue('escola_id', selectedSchool.id)
    }
  }, [selectedSchool, form])

  // Fetch Documents when School Changes
  useEffect(() => {
    const fetchDocs = async () => {
      if (!selectedSchoolId) {
        setDocuments({ code: null, commitment: null })
        return
      }
      setLoadingDocs(true)
      try {
        const [code, commitment] = await Promise.all([
          portalService.getCodeOfConduct(selectedSchoolId),
          portalService.getManagementCommitment(selectedSchoolId),
        ])
        setDocuments({ code, commitment })
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setLoadingDocs(false)
      }
    }

    fetchDocs()
  }, [selectedSchoolId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      // Basic validation size limit (e.g. 5MB)
      const validFiles = newFiles.filter((file) => file.size <= 5 * 1024 * 1024)

      if (validFiles.length !== newFiles.length) {
        toast.error('Alguns arquivos foram ignorados pois excedem 5MB.')
      }

      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: z.infer<typeof complaintSchema>) => {
    setLoading(true)
    try {
      // 1. Upload Evidence if any
      let uploadedUrls: string[] = []
      if (files.length > 0) {
        uploadedUrls = await portalService.uploadEvidence(files)
      }

      // 2. Prepare Data
      // If user is not logged in, force anonymous just in case, but data.anonimo handles the choice
      const isAnonymous = data.anonimo

      const envolvidos_detalhes = {
        vitima: {
          funcao: data.vitima_funcao,
          nome: data.vitima_nome,
          setor_turma: data.vitima_setor,
        },
        autor: {
          funcao: data.autor_funcao,
          nome: data.autor_nome,
          descricao: data.autor_descricao,
        },
      }

      // 3. Create Complaint
      const result = await portalService.createComplaint({
        escola_id: data.escola_id,
        descricao: data.description,
        anonimo: isAnonymous,
        denunciante_id: user?.id,
        categoria: data.categories,
        envolvidos_detalhes,
        evidencias_urls: uploadedUrls,
      })

      setProtocol(result.protocolo)
      toast.success('Denúncia registrada com sucesso.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Erro ao registrar denúncia. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (protocol) {
    return (
      <div className="container mx-auto max-w-lg pt-10 text-center animate-fade-in pb-20">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Denúncia Registrada
        </h2>
        <p className="text-slate-500 mb-8">
          Sua denúncia foi recebida com segurança e será analisada.
        </p>

        <Card className="border-green-500 border-t-4 shadow-lg mb-8">
          <CardContent className="pt-8 pb-8 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Seu Protocolo
            </p>
            <p className="text-5xl font-mono font-bold text-primary select-all tracking-wider">
              {protocol}
            </p>
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm mt-4 inline-block">
              <AlertTriangle className="h-4 w-4 inline mr-2 mb-0.5" />
              Guarde este número para acompanhar o andamento.
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full h-12 text-lg"
            onClick={() => navigate('/public/complaint/status')}
          >
            Acompanhar Status
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container mx-auto max-w-3xl py-8 px-4 animate-fade-in space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Início
          </Button>
          <Button
            variant="link"
            className="text-blue-600 gap-2"
            onClick={() => window.open('https://ouvidoria.gov.br', '_blank')}
          >
            Outros Canais Oficiais <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="mx-auto bg-red-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Canal de Denúncias
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Este é um espaço seguro para relatar violações de ética, conduta ou
            compliance. Sua identidade será preservada se desejar.
          </p>
        </div>

        {/* Assistance Card */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-50 p-2 rounded-full">
              <HelpCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Como podemos ajudar?
              </p>
              <p className="text-sm text-slate-500">
                Deseja registrar uma denúncia ou consultar canais oficiais?
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-400 ml-auto" />
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. Instituição e Contexto */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
                  <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
                    1
                  </span>
                  Instituição e Contexto
                </CardTitle>
                <CardDescription>
                  Identifique onde o fato ocorreu e a natureza da ocorrência.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="escola_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        INSTITUIÇÃO DE ENSINO{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover open={openSchool} onOpenChange={setOpenSchool}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openSchool}
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground',
                              )}
                              disabled={!!selectedSchool}
                            >
                              {field.value
                                ? schools.find((s) => s.id === field.value)
                                    ?.name || selectedSchool?.name
                                : 'Selecione a escola relacionada...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar escola..." />
                            <CommandList>
                              <CommandEmpty>
                                Escola não encontrada.
                              </CommandEmpty>
                              {loadingSchools && (
                                <div className="p-4 text-sm text-center text-muted-foreground">
                                  Carregando...
                                </div>
                              )}
                              <CommandGroup>
                                {schools.map((school) => (
                                  <CommandItem
                                    key={school.id}
                                    value={school.name}
                                    onSelect={() => {
                                      form.setValue('escola_id', school.id)
                                      setOpenSchool(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        school.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    {school.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Institutional Documents Section */}
                {selectedSchoolId && (
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileSearch className="h-4 w-4 text-slate-500" />
                      <h4 className="text-sm font-semibold text-slate-700">
                        Documentos de Integridade
                      </h4>
                    </div>

                    {loadingDocs ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Código de Conduta */}
                        {documents.code ? (
                          <a
                            href={documents.code.arquivo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <div className="bg-white border hover:border-blue-400 hover:shadow-sm transition-all rounded-md p-3 flex items-center gap-3 cursor-pointer h-full">
                              <div className="bg-blue-50 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                  Código de Conduta
                                </p>
                                <p className="text-xs text-slate-500">
                                  Ler documento
                                </p>
                              </div>
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </div>
                          </a>
                        ) : (
                          <div className="bg-slate-100/50 border border-slate-100 rounded-md p-3 flex items-center gap-3 h-full opacity-60">
                            <div className="bg-slate-200 p-2 rounded-full">
                              <FileText className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-500">
                                Código de Conduta
                              </p>
                              <p className="text-xs text-slate-400">
                                Não disponível
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Compromisso Alta Gestão */}
                        {documents.commitment ? (
                          <a
                            href={documents.commitment.arquivo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <div className="bg-white border hover:border-blue-400 hover:shadow-sm transition-all rounded-md p-3 flex items-center gap-3 cursor-pointer h-full">
                              <div className="bg-blue-50 p-2 rounded-full">
                                <Shield className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                  Compromisso de Gestão
                                </p>
                                <p className="text-xs text-slate-500">
                                  Ler documento
                                </p>
                              </div>
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </div>
                          </a>
                        ) : (
                          <div className="bg-slate-100/50 border border-slate-100 rounded-md p-3 flex items-center gap-3 h-full opacity-60">
                            <div className="bg-slate-200 p-2 rounded-full">
                              <Shield className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-500">
                                Compromisso de Gestão
                              </p>
                              <p className="text-xs text-slate-400">
                                Não disponível
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        TIPO DE OCORRÊNCIA{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover
                        open={openCategory}
                        onOpenChange={setOpenCategory}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between h-auto min-h-[40px]',
                                !field.value?.length && 'text-muted-foreground',
                              )}
                            >
                              {field.value?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {field.value.map((cat) => (
                                    <Badge
                                      key={cat}
                                      variant="secondary"
                                      className="mr-1 mb-1"
                                    >
                                      {cat}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                'Selecione as categorias aplicáveis...'
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar categoria..." />
                            <CommandList>
                              <CommandEmpty>
                                Nenhuma categoria encontrada.
                              </CommandEmpty>
                              <div className="max-h-[300px] overflow-y-auto">
                                {CATEGORY_GROUPS.map((group) => (
                                  <CommandGroup
                                    key={group.heading}
                                    heading={group.heading}
                                  >
                                    {group.items.map((category) => (
                                      <CommandItem
                                        key={category}
                                        value={category}
                                        onSelect={() => {
                                          const current = field.value || []
                                          const updated = current.includes(
                                            category,
                                          )
                                            ? current.filter(
                                                (c) => c !== category,
                                              )
                                            : [...current, category]
                                          form.setValue('categories', updated, {
                                            shouldValidate: true,
                                          })
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            field.value?.includes(category)
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                        {category}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                ))}
                              </div>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Selecione uma ou mais categorias que se enquadram no
                        ocorrido.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 2. Quem sofreu o ocorrido? */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
                  <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
                    2
                  </span>
                  Quem sofreu o ocorrido?
                </CardTitle>
                <CardDescription>
                  Informe quem foi afetado pela situação relatada. Pode ser você
                  ou outra pessoa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="vitima_funcao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        QUAL A FUNÇÃO DA VÍTIMA?{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a função..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vitima_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NOME DA VÍTIMA (SE SOUBER)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Maria Souza" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vitima_setor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SETOR/TURMA/SALA DA VÍTIMA</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 9º ano B, Secretaria, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 3. Quem praticou a ação? */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
                  <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
                    3
                  </span>
                  Quem praticou a ação?
                </CardTitle>
                <CardDescription>
                  Selecione a função ou vínculo da pessoa que praticou a ação ou
                  omissão.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="autor_funcao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        FUNÇÃO / VÍNCULO DO AUTOR{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o vínculo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="autor_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NOME DA PESSOA (SE SOUBER)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Silva" {...field} />
                        </FormControl>
                        <FormDescription>
                          Preencha apenas se souber.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="autor_descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DESCRIÇÃO (SE NÃO SOUBER O NOME)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: professor de matemática do 8º ano, turno da manhã..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4. Relato Detalhado */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
                  <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
                    4
                  </span>
                  Relato Detalhado
                </CardTitle>
                <CardDescription>
                  Descreva o que aconteceu e anexe provas se tiver.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        DESCRIÇÃO DA OCORRÊNCIA{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o que aconteceu, quando, onde e quem estava envolvido. Quanto mais detalhes, melhor será a apuração."
                          className="min-h-[150px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Relate os fatos de forma clara e objetiva. Mínimo de 20
                        caracteres.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Anexar Evidências (Opcional)</FormLabel>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-700">
                      Clique para adicionar documentos
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Suporta JPG, PNG e PDF (Máx 5MB)
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,application/pdf,audio/*,video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      // Hack to allow same file selection again if cleared
                      value=""
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white border p-2 rounded-md shadow-sm"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="bg-slate-100 p-1 rounded">
                              <UploadCloud className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="text-sm truncate max-w-[200px] sm:max-w-xs">
                              {file.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 5. Identificação */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
                  <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
                    5
                  </span>
                  Identificação
                </CardTitle>
                <CardDescription>
                  Escolha se deseja se identificar ou manter o anonimato.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="anonimo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-white">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-bold">
                          DENÚNCIA ANÔNIMA
                        </FormLabel>
                        <FormDescription>
                          Seus dados não serão identificados na apuração.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-teal-700 hover:bg-teal-800 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Denúncia'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
