import { useState, useEffect } from 'react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z
    .string()
    .min(6, { message: 'Senha deve ter no mínimo 6 caracteres.' }),
})

export default function Login() {
  const { signIn, user, profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Redirect if already logged in or after successful login
  useEffect(() => {
    if (!appLoading && user && profile) {
      if (profile === 'senior') {
        navigate('/senior/schools')
      } else if (profile === 'administrador' || profile === 'admin_gestor') {
        navigate('/admin/dashboard')
      } else if (profile === 'colaborador') {
        navigate('/collaborator/training')
      } else if (profile === 'gestor') {
        navigate('/manager/risks')
      } else {
        navigate('/')
      }
    }
  }, [user, profile, appLoading, navigate])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)
    try {
      const { error: signInError } = await signIn(values.email, values.password)

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('Erro ao realizar login. Verifique suas credenciais.')
        } else {
          console.error('Login Error:', signInError)
          setError('Ocorreu um erro ao realizar o login. Tente novamente.')
        }
        setLoading(false)
      } else {
        toast.success('Login realizado com sucesso!')
      }
    } catch (err) {
      console.error('Unexpected Error:', err)
      setError('Ocorreu um erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-slate-200 dark:border-slate-800 bg-card z-10">
        <CardHeader className="text-center space-y-3 pb-8">
          <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
            Login ALERTIA
          </CardTitle>
          <CardDescription className="text-base font-semibold text-muted-foreground">
            Acesse sua conta para gerenciar programas de integridade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 text-left shadow-md border-2 border-destructive/20 bg-destructive/5"
            >
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="ml-2 font-bold">Erro</AlertTitle>
              <AlertDescription className="ml-2 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground text-base font-bold">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        {...field}
                        className="h-14 text-lg border-2 border-slate-400 dark:border-slate-600 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm hover:border-slate-500 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage className="font-semibold" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground text-base font-bold">
                      Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="******"
                        {...field}
                        className="h-14 text-lg border-2 border-slate-400 dark:border-slate-600 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm hover:border-slate-500 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage className="font-semibold" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-14 text-xl font-extrabold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 hover:brightness-110 rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
