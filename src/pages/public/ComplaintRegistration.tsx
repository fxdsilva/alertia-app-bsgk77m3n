import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
} from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { portalService } from '@/services/portalService'
import { School } from '@/lib/mockData'
import { InstitutionStep } from '@/components/complaint-form/InstitutionStep'
import { VictimStep } from '@/components/complaint-form/VictimStep'
import { AuthorStep } from '@/components/complaint-form/AuthorStep'
import { DetailsStep } from '@/components/complaint-form/DetailsStep'
import { IdentificationStep } from '@/components/complaint-form/IdentificationStep'
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_PREFIXES,
  ACCEPTED_FILE_TYPES_STRING,
} from '@/components/complaint-form/constants'

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
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [schools, setSchools] = useState<School[]>([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [files, setFiles] = useState<File[]>([])

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

  useEffect(() => {
    const fetchSchools = async () => {
      setLoadingSchools(true)
      try {
        const data = await portalService.getSchools()
        setSchools(data)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar lista de escolas. Verifique sua conexão.')
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)

      const validFiles = newFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`O arquivo ${file.name} excede o limite de 50MB.`)
          return false
        }

        const isValidType =
          ALLOWED_MIME_PREFIXES.some((prefix) =>
            file.type.startsWith(prefix),
          ) ||
          ACCEPTED_FILE_TYPES_STRING.split(',').some((ext) =>
            file.name.toLowerCase().endsWith(ext),
          )

        if (!isValidType) {
          toast.error(`Formato de arquivo não suportado: ${file.name}`)
          return false
        }

        return true
      })

      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: z.infer<typeof complaintSchema>) => {
    setLoading(true)
    setUploadStatus('')

    try {
      let uploadedUrls: string[] = []
      if (files.length > 0) {
        setUploadStatus(`Enviando ${files.length} arquivo(s)...`)
        uploadedUrls = await portalService.uploadEvidence(files)
      }

      setUploadStatus('Finalizando registro...')

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

      const result = await portalService.createComplaint({
        escola_id: data.escola_id,
        descricao: data.description,
        anonimo: data.anonimo,
        denunciante_id: user?.id,
        categoria: data.categories,
        envolvidos_detalhes,
        evidencias_urls: uploadedUrls,
      })

      setProtocol(result.protocolo)
      toast.success('Denúncia registrada com sucesso.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      // Improved error handling
      const errorMsg =
        typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : 'Erro ao registrar denúncia. Tente novamente.'

      console.error('Registration failed:', error)

      if (errorMsg.includes('FormData object could not be cloned')) {
        toast.error(
          'Erro de compatibilidade no upload. Tente outro navegador ou contate o suporte.',
        )
      } else if (
        errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('Network request failed')
      ) {
        toast.error(
          'Erro de conexão. Verifique sua internet e tente novamente.',
        )
      } else if (errorMsg.includes('Status "Denúncia registrada" not found')) {
        toast.error('Erro de configuração do sistema. Contate o suporte.')
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setLoading(false)
      setUploadStatus('')
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
            <InstitutionStep
              schools={schools}
              loadingSchools={loadingSchools}
              selectedSchool={selectedSchool}
            />

            <VictimStep />

            <AuthorStep />

            <DetailsStep
              files={files}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
            />

            <IdentificationStep />

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-teal-700 hover:bg-teal-800 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {uploadStatus || 'Enviando...'}
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
