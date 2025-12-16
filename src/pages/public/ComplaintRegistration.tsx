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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardFooter,
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
import { toast } from 'sonner'
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  ChevronsUpDown,
  Check,
} from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { portalService } from '@/services/portalService'
import { School } from '@/lib/mockData'
import { cn } from '@/lib/utils'

const complaintSchema = z.object({
  escola_id: z
    .string({ required_error: 'Selecione uma escola.' })
    .min(1, 'Selecione uma escola.'),
  description: z
    .string()
    .min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  anonimo: z.boolean().default(true),
})

export default function ComplaintRegistration() {
  const [protocol, setProtocol] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [open, setOpen] = useState(false)

  const { selectedSchool, user } = useAppStore()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      escola_id: selectedSchool?.id || '',
      description: '',
      anonimo: true,
    },
  })

  useEffect(() => {
    // Only fetch schools if we don't have a pre-selected school from context
    // or if we want to allow switching. But usually fetching all is good practice
    // for the combobox to work if the user needs to select.
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

  // Update escola_id if selectedSchool changes (e.g. from context)
  useEffect(() => {
    if (selectedSchool) {
      form.setValue('escola_id', selectedSchool.id)
    }
  }, [selectedSchool, form])

  const onSubmit = async (data: z.infer<typeof complaintSchema>) => {
    setLoading(true)
    try {
      // For unauthenticated users, enforce anonymous
      // Ideally this is also enforced by UI, but good to double check
      const isAnonymous = !user ? true : data.anonimo

      const result = await portalService.createComplaint({
        escola_id: data.escola_id,
        descricao: data.description,
        anonimo: isAnonymous,
        denunciante_id: user?.id,
      })

      setProtocol(result.protocolo)
      toast.success('Denúncia registrada com sucesso.')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao registrar denúncia. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (protocol) {
    return (
      <div className="container mx-auto max-w-lg pt-10 text-center animate-fade-in pb-10">
        <Card className="border-green-500 border-t-4 shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Denúncia Registrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sua denúncia foi recebida com segurança.
            </p>
            <div className="bg-muted p-6 rounded-lg border-dashed border-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Seu Protocolo
              </p>
              <p className="text-4xl font-mono font-bold text-primary mt-2 select-all">
                {protocol}
              </p>
            </div>
            <p className="text-sm text-red-500 font-medium">
              Guarde este número! Ele é a única forma de acompanhar o andamento
              da sua denúncia.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 justify-center">
            <Button
              className="w-full"
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
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 py-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(selectedSchool ? '/public/portal' : '/')}
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Faça sua Denúncia</h1>
        <p className="text-muted-foreground">
          Relate irregularidades, desvios de conduta ou violações de ética.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhe da Denúncia</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="escola_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Instituição de Ensino</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={!!selectedSchool}
                          >
                            {field.value
                              ? schools.find(
                                  (school) => school.id === field.value,
                                )?.name || selectedSchool?.name
                              : 'Selecione a escola...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[300px] sm:w-[600px] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="Buscar escola..." />
                          <CommandList>
                            <CommandEmpty>
                              Nenhuma escola encontrada.
                            </CommandEmpty>
                            <CommandGroup>
                              {loadingSchools && (
                                <CommandItem disabled>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Carregando...
                                </CommandItem>
                              )}
                              {schools.map((school) => (
                                <CommandItem
                                  key={school.id}
                                  value={school.name}
                                  onSelect={() => {
                                    form.setValue('escola_id', school.id, {
                                      shouldValidate: true,
                                    })
                                    setOpen(false)
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o que aconteceu com o máximo de detalhes possível."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Forneça detalhes como: O que? Quando? Onde? Quem?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anonimo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!user} // Force check if user is not logged in (public)
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Desejo realizar a denúncia de forma anônima
                      </FormLabel>
                      <FormDescription>
                        {!user
                          ? 'Para denúncias públicas, o anonimato é obrigatório.'
                          : 'Seus dados não serão vinculados à denúncia.'}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Denúncia'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
