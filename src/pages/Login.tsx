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
import { Loader2, AlertCircle, ArrowLeft, Download } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isRecovery, setIsRecovery] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { isInstallable, install } = usePWAInstall()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResettingPassword(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await signIn(email, password)

      if (error) {
        if (
          error.status === 400 ||
          error.message.includes('Invalid login credentials')
        ) {
          setErrorMsg(
            'E-mail ou senha inválidos. Caso tenha esquecido sua senha, utilize a opção "Esqueci minha senha".',
          )
        } else {
          setErrorMsg('Ocorreu um erro ao tentar entrar. Tente novamente.')
        }
      } else {
        toast.success('Login realizado com sucesso!')
        navigate('/dashboard')
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
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) {
        setErrorMsg(
          'Erro ao enviar e-mail de recuperação. Verifique o endereço e tente novamente.',
        )
      } else {
        toast.success(
          'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.',
        )
        setIsRecovery(false)
      }
    } catch (err) {
      setErrorMsg('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrorMsg('Erro ao atualizar senha. O link pode ter expirado.')
      } else {
        toast.success('Senha atualizada com sucesso! Você já pode acessar.')
        setIsResettingPassword(false)
        navigate('/dashboard')
      }
    } catch (err) {
      setErrorMsg('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (isResettingPassword) {
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
              onClick={install}
              className="gap-2 bg-white/50 backdrop-blur-sm shadow-sm border-primary/20 text-primary hover:bg-primary/5"
            >
              <Download className="h-4 w-4" /> Instalar App
            </Button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
          <Card className="w-full max-w-md shadow-lg border-primary/20">
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight text-primary">
                Nova Senha
              </CardTitle>
              <CardDescription>Digite sua nova senha abaixo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Salvar Nova Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            onClick={install}
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguarde...
                  </>
                ) : isRecovery ? (
                  'Enviar link de recuperação'
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>

          {isRecovery && (
            <CardFooter className="flex justify-center border-t pt-4 pb-2">
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
