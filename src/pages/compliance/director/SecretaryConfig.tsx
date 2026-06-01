import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Trash2, Plus, Building2 } from 'lucide-react'
import {
  secretaryService,
  SecretaryDashboardConfig,
} from '@/services/secretaryService'

const schema = z.object({
  welcomeMessage: z.string().min(1, 'A mensagem é obrigatória'),
  showStats: z.boolean(),
  showSchools: z.boolean(),
  showReports: z.boolean(),
  customLinks: z.array(
    z.object({
      title: z.string().min(1, 'O título é obrigatório'),
      url: z
        .string()
        .url('URL inválida, precisa iniciar com http:// ou https://'),
    }),
  ),
})

export default function SecretaryConfig() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  const form = useForm<SecretaryDashboardConfig>({
    resolver: zodResolver(schema),
    defaultValues: {
      welcomeMessage: '',
      showStats: true,
      showSchools: true,
      showReports: true,
      customLinks: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customLinks',
  })

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const config = await secretaryService.getSecretaryConfig()
      if (config) {
        form.reset(config)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description:
          'Não foi possível carregar as configurações da secretaria.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(data: SecretaryDashboardConfig) {
    try {
      await secretaryService.updateSecretaryConfig(data)
      toast({
        title: 'Sucesso',
        description:
          'As configurações do painel da Secretaria foram atualizadas.',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando configurações...
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuração da Secretaria
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o conteúdo e a visibilidade do painel da Secretaria de
            Educação.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mensagem de Boas-vindas</CardTitle>
              <CardDescription>
                Esta mensagem será exibida em destaque no painel da Secretaria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Digite a mensagem de boas-vindas..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibilidade de Módulos</CardTitle>
              <CardDescription>
                Ative ou desative seções específicas para o perfil da
                Secretaria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="showStats"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Estatísticas Gerais
                      </FormLabel>
                      <FormDescription>
                        Mostrar cartões de estatísticas (total de denúncias,
                        investigações, etc).
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="showSchools"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Lista de Escolas
                      </FormLabel>
                      <FormDescription>
                        Mostrar a tabela com indicadores de cada escola da rede.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="showReports"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Relatórios Consolidados
                      </FormLabel>
                      <FormDescription>
                        Permitir acesso aos relatórios macro da rede
                        educacional.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links e Aplicativos Compartilhados</CardTitle>
              <CardDescription>
                Adicione links úteis, materiais de apoio ou sistemas externos
                para a Secretaria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col md:flex-row items-start md:items-end gap-4 p-4 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="flex-1 w-full space-y-4">
                    <FormField
                      control={form.control}
                      name={`customLinks.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Link</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Portal do MEC" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`customLinks.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="shrink-0 mt-4 md:mt-0"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => append({ title: '', url: '' })}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Novo Link
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg">
              Salvar Configurações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
