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
import { Loader2, AlertCircle, ArrowLeft, Download } from 'lucide-react'
import { usePWAInstall } from '@/hooks/use-pwa-install'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { isInstallable, installPWA } = usePWAInstall()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        if (!window.location.hash) {
          toast.error('Sessão de recuperação inválida ou expirada.')
          navigate('/login')
        }
      }
    })
  }, [navigate])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }
    if (password.length < 8) {
      setErrorMsg('A senha deve ter pelo menos 8 caracteres.')
      return
    }

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
        navigate('/')
      }
    } catch (err) {
      setErrorMsg('Erro inesperado. Tente novamente.')
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
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={loading}>
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
