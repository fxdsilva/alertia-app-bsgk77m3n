import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import { toast } from 'sonner'

const formSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z
    .string()
    .min(6, { message: 'Senha deve ter no mínimo 6 caracteres.' }),
})

export default function Login() {
  const { login, user } = useAppStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Redirect if already logged in
  if (user) {
    if (user.role === 'administrador') {
      navigate('/admin/dashboard')
    } else {
      navigate('/')
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const success = await login(values.email, values.password)
      if (success) {
        toast.success('Login realizado com sucesso!')
        // Navigation is handled by auth state change listener ideally,
        // but we can trigger here too or let the effect handle it.
        // But since useEffect is async, we might want to wait or rely on simple redirect
        // The useEffect in AppContext handles setting user.
        // We can just wait a bit or let the user object update trigger redirect?
        // Let's rely on the user check at top of component + re-render
        // But for smoother UX, we can manually nav.
        navigate('/')
      } else {
        toast.error('Credenciais inválidas.')
      }
    } catch (error) {
      toast.error('Erro ao realizar login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Login ALERTIA
          </CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar programas de integridade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
