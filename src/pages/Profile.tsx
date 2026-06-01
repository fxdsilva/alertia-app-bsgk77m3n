import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCircle, Shield, Key, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/use-auth'
import useAppStore from '@/stores/useAppStore'
import { toast } from 'sonner'

const securityFormSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'general'
  const { user, updatePassword } = useAuth()
  const { user: appUser, profile } = useAppStore()
  const [loading, setLoading] = useState(false)

  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSecuritySubmit = async (
    values: z.infer<typeof securityFormSchema>,
  ) => {
    setLoading(true)
    const { error } = await updatePassword(values.password)
    setLoading(false)

    if (error) {
      toast.error(
        'Erro ao alterar senha. Verifique se você está autenticado corretamente.',
      )
    } else {
      toast.success('Senha alterada com sucesso')
      securityForm.reset()
    }
  }

  return (
    <div className="container max-w-4xl p-6 mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e segurança da conta.
        </p>
      </div>

      <Tabs
        defaultValue={defaultTab}
        onValueChange={(v) => setSearchParams({ tab: v })}
      >
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="general" className="gap-2">
            <UserCircle className="h-4 w-4" /> Geral
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detalhes da sua conta no sistema.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={appUser?.nome_usuario || ''}
                    readOnly
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ''} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Perfil</label>
                  <Input
                    value={profile?.replace(/_/g, ' ').toUpperCase() || ''}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <p className="text-sm text-muted-foreground">
                Atualize sua senha de acesso. A nova senha deve ter no mínimo 8
                caracteres.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form
                  onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                  className="space-y-4 max-w-md"
                >
                  <FormField
                    control={securityForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Nova senha"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Confirme a nova senha"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Alterar Senha
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
