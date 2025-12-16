import { useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'

const complaintSchema = z.object({
  category: z.string().min(1, { message: 'Selecione uma categoria.' }),
  description: z
    .string()
    .min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }),
  date: z.string().optional(),
  location: z.string().optional(),
  involved: z.string().optional(),
  files: z.any().optional(),
})

export default function ComplaintRegistration() {
  const [step, setStep] = useState(1)
  const [protocol, setProtocol] = useState<string | null>(null)
  const { selectedSchool } = useAppStore()

  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: '',
      description: '',
      date: '',
      location: '',
      involved: '',
    },
  })

  const nextStep = async () => {
    const fieldsToValidate =
      step === 1
        ? ['category']
        : step === 2
          ? ['description', 'date', 'location', 'involved']
          : []
    // @ts-expect-error - trigger accepts string array
    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const onSubmit = (data: z.infer<typeof complaintSchema>) => {
    // Mock submission
    console.log(data)
    const newProtocol = `PRT-${Math.floor(Math.random() * 1000000)}`
    setProtocol(newProtocol)
    setStep(5)
    toast.success('Denúncia registrada com sucesso.')
  }

  const progress = (step / 5) * 100

  if (protocol) {
    return (
      <div className="container mx-auto max-w-lg pt-10 text-center animate-fade-in">
        <Card className="border-green-500 border-t-4">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Denúncia Registrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sua denúncia foi recebida com segurança e anonimato.
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
          <CardFooter className="justify-center">
            <Button
              onClick={() =>
                (window.location.href = '/public/complaint/status')
              }
            >
              Acompanhar Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Registrar Denúncia Anônima</h1>
        <p className="text-muted-foreground">Para {selectedSchool?.name}</p>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-slide-up">
                  <h2 className="text-xl font-semibold">
                    1. Natureza do Incidente
                  </h2>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qual o tipo de violação?</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Assédio">
                              Assédio Moral ou Sexual
                            </SelectItem>
                            <SelectItem value="Fraude">
                              Fraude ou Desvio
                            </SelectItem>
                            <SelectItem value="Discriminação">
                              Discriminação
                            </SelectItem>
                            <SelectItem value="Violência">
                              Violência Física
                            </SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-slide-up">
                  <h2 className="text-xl font-semibold">
                    2. Detalhes do Ocorrido
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data (Aproximada)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Sala de aula, Pátio"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Detalhada</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o que aconteceu com o máximo de detalhes possível, sem se identificar."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Não inclua seus dados pessoais aqui.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="involved"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pessoas Envolvidas (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nomes ou cargos dos envolvidos"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-slide-up">
                  <h2 className="text-xl font-semibold">
                    3. Evidências (Opcional)
                  </h2>
                  <div className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <p className="text-muted-foreground">
                      Clique para anexar arquivos (Imagens, PDF)
                    </p>
                    <p className="text-xs text-red-500 mt-2">
                      Atenção: Remova metadados que possam te identificar dos
                      arquivos.
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-slide-up text-center">
                  <h2 className="text-xl font-semibold">
                    4. Confirmação de Anonimato
                  </h2>
                  <ShieldAlert className="h-16 w-16 text-secondary mx-auto" />
                  <p className="text-lg">
                    Você está prestes a enviar uma denúncia anônima.
                  </p>
                  <p className="text-muted-foreground">
                    O sistema não registrou seu IP ou localização. Para garantir
                    seu anonimato, certifique-se de não ter incluído seu nome na
                    descrição ou nos arquivos anexados.
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Voltar
                  </Button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Próximo
                  </Button>
                ) : (
                  <Button type="submit" variant="destructive">
                    Confirmar e Enviar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
