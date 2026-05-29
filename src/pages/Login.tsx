import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePWAInstall } from '@/hooks/use-pwa-install'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isRecovery, setIsRecovery] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [recoveryCooldown, setRecoveryCooldown] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (recoveryCooldown > 0) {
      timer = setInterval(() => {
        setRecoveryCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [recoveryCooldown])
  const { signIn, signInWithGoogle } = useAuth()
  const { isInstallable, installPWA } = usePWAInstall()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setErrorMsg('Erro ao tentar entrar com o Google. Tente novamente.')
        setLoading(false)
      }
    } catch (err) {
      setErrorMsg('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await signIn(email, password)

      if (error) {
        const errorObj = error as any
        const errorStr = errorObj?.message
          ? String(errorObj.message).toLowerCase()
          : String(error).toLowerCase()

        const isInvalidCredentials =
          errorObj?.status === 400 ||
          errorObj?.code === 'invalid_credentials' ||
          errorStr.includes('invalid login credentials') ||
          errorStr.includes('invalid_credentials')

        if (isInvalidCredentials) {
          setErrorMsg('E-mail ou senha incorretos')
          setPassword('')
        } else {
          setErrorMsg('Ocorreu um erro ao tentar entrar. Tente novamente.')
        }
      } else {
        toast.success('Login realizado com sucesso!')
        navigate('/')
      }
    } catch (err) {
      setErrorMsg('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErrorMsg('Por favor, informe seu e-mail para recuperação.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        if (
          error.status === 429 ||
          error.message?.includes('rate_limit') ||
          (error as any).code === 'over_email_send_rate_limit'
        ) {
          toast.error(
            'Muitas tentativas. Por favor, aguarde um minuto antes de tentar novamente.',
          )
          setRecoveryCooldown(60)
          return
        }
        throw error
      }

      toast.success(
        'Se o e-mail informado estiver em nossa base, você receberá as instruções para redefinir sua senha em breve.',
        {
          description: 'Verifique também sua pasta de Spam ou Lixo Eletrônico.',
          duration: 6000,
        },
      )

      setRecoveryCooldown(60)
    } catch (err: any) {
      const isRateLimit =
        err?.status === 429 ||
        err?.message?.includes('rate_limit') ||
        err?.code === 'over_email_send_rate_limit'

      if (isRateLimit) {
        toast.error(
          'Muitas tentativas. Por favor, aguarde um minuto antes de tentar novamente.',
        )
        setRecoveryCooldown(60)
      } else {
        toast.success(
          'Se o e-mail informado estiver em nossa base, você receberá as instruções para redefinir sua senha em breve.',
          {
            description:
              'Verifique também sua pasta de Spam ou Lixo Eletrônico.',
            duration: 6000,
          },
        )
        setRecoveryCooldown(60)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 p-4">
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2 text-muted-foreground hover:text-primary px-2"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Início
        </Button>
        {isInstallable && (
          <Button
            variant="outline"
            onClick={installPWA}
            className="gap-2 bg-white/50 backdrop-blur-sm shadow-sm border-primary/20 text-primary hover:bg-primary/5"
          >
            <Download className="h-4 w-4" /> Instalar App
          </Button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        <Card className="w-full max-w-md shadow-lg border-primary/10">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              {isRecovery ? 'Recuperar Senha' : 'Acesso ao Sistema'}
            </CardTitle>
            <CardDescription>
              {isRecovery
                ? 'Informe seu e-mail para receber um link de redefinição.'
                : 'Insira suas credenciais para acessar a plataforma.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isRecovery && (
              <div className="space-y-4 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-sm font-medium h-auto py-3 px-4 text-left justify-start gap-3 whitespace-normal min-h-11"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="leading-tight">
                    Entre com sua conta Google utilizando o e-mail cadastrado.
                  </span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form
              onSubmit={isRecovery ? handleRecovery : handleLogin}
              className="space-y-4"
            >
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  required
                  disabled={loading}
                  className={
                    errorMsg && !isRecovery
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                />
              </div>

              {!isRecovery && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs font-normal text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setIsRecovery(true)
                        setErrorMsg('')
                      }}
                    >
                      Esqueci minha senha
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errorMsg) setErrorMsg('')
                      }}
                      required
                      disabled={loading}
                      className={
                        errorMsg && !isRecovery
                          ? 'border-red-500 focus-visible:ring-red-500 pr-10'
                          : 'pr-10'
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={
                  loading ||
                  (isRecovery && recoveryCooldown > 0) ||
                  (isRecovery
                    ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password)
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguarde...
                  </>
                ) : isRecovery ? (
                  recoveryCooldown > 0 ? (
                    `Aguarde ${recoveryCooldown}s para tentar novamente`
                  ) : (
                    'Enviar link de recuperação'
                  )
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>

          {isRecovery && (
            <CardFooter className="flex flex-col justify-center border-t pt-4 pb-2 gap-4">
              {recoveryCooldown > 0 && (
                <p className="text-sm text-center text-muted-foreground px-4">
                  Verifique também sua pasta de Spam ou Lixo Eletrônico.
                </p>
              )}
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => {
                  setIsRecovery(false)
                  setErrorMsg('')
                }}
              >
                Voltar para o login
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
