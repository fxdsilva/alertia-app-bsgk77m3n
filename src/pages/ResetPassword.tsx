import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Verifies if the user has a valid session or is carrying a recovery hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !window.location.hash) {
        toast.error(
          'O link de recuperação expirou ou é inválido. Por favor, solicite um novo.',
        )
        navigate('/login')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // handled signed out scenario if it occurs during reset
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  const validate = () => {
    let isValid = true
    setPasswordError('')
    setConfirmError('')
    setGlobalError('')

    if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres.')
      isValid = false
    }

    if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem.')
      isValid = false
    }

    return isValid
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setGlobalError(
          'O link de recuperação expirou ou é inválido. Por favor, solicite um novo.',
        )
        toast.error(
          'O link de recuperação expirou ou é inválido. Por favor, solicite um novo.',
        )
      } else {
        toast.success('Senha atualizada com sucesso!')
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (err) {
      setGlobalError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 p-4">
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/login')}
          className="gap-2 text-muted-foreground hover:text-primary px-2"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Login
        </Button>
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
              {globalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{globalError}</p>
                </div>
              )}

              <div className="space-y-2 relative">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) setPasswordError('')
                    }}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (confirmError) setConfirmError('')
                    }}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-sm text-red-500">{confirmError}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Atualizar Senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
