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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { portalService } from '@/services/portalService'

const complaintSchema = z.object({
  description: z
    .string()
    .min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  anonimo: z.boolean().default(true),
})

export default function ComplaintRegistration() {
  const [protocol, setProtocol] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { selectedSchool, user } = useAppStore()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      description: '',
      anonimo: true,
    },
  })

  const onSubmit = async (data: z.infer<typeof complaintSchema>) => {
    if (!selectedSchool) {
      toast.error('Escola não selecionada.')
      return
    }

    setLoading(true)
    try {
      const result = await portalService.createComplaint({
        escola_id: selectedSchool.id,
        descricao: data.description,
        anonimo: data.anonimo,
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
      <div className="container mx-auto max-w-lg pt-10 text-center animate-fade-in">
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
              onClick={() => navigate('/public/portal')}
            >
              Voltar ao Portal
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 py-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/public/portal')}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Faça sua Denúncia</h1>
        <p className="text-muted-foreground">
          Para: {selectedSchool?.name || 'Escola Selecionada'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Ocorrência</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Desejo realizar a denúncia de forma anônima
                      </FormLabel>
                      <FormDescription>
                        Seus dados não serão vinculados à denúncia.
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
