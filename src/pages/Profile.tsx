import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import useAppStore from '@/stores/useAppStore'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Shield, User as UserIcon } from 'lucide-react'

const securitySchema = z
  .object({
    newPassword: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type SecurityFormValues = z.infer<typeof securitySchema>

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'general'
  const { user: authUser, loading } = useAuth()
  const { user: storeUser } = useAppStore()
  const navigate = useNavigate()
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!loading && !authUser) {
      navigate('/login', { replace: true })
    }
  }, [authUser, loading, navigate])

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (values: SecurityFormValues) => {
    setIsUpdating(true)
    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    })
    setIsUpdating(false)

    if (error) {
      toast.error('Erro ao atualizar senha', {
        description: error.message,
      })
    } else {
      toast.success('Senha alterada com sucesso!')
      form.reset()
    }
  }

  if (loading || !authUser) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8 animate-fade-in px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Configurações da Conta
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e credenciais de segurança.
        </p>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(val) => setSearchParams({ tab: val })}
        className="space-y-6"
      >
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Segurança</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 outline-none">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>
                Seus dados básicos de perfil no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Nome de Usuário
                  </p>
                  <p className="text-base font-medium">
                    {storeUser?.name ||
                      authUser.user_metadata?.nome_usuario ||
                      'Não informado'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email de Acesso
                  </p>
                  <p className="text-base font-medium">{authUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Perfil de Acesso
                  </p>
                  <p className="text-base font-medium capitalize">
                    {storeUser?.role?.replace(/_/g, ' ') || 'Não definido'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 outline-none">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Atualize sua senha de acesso. Recomendamos o uso de uma senha
                forte. Não é necessário informar a senha atual pois você já está
                autenticado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 max-w-md"
                >
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Mínimo de 8 caracteres"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Repita a nova senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || isUpdating}
                    className="w-full sm:w-auto"
                  >
                    {isUpdating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Atualizar Senha
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
