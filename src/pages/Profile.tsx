import { useState } from 'react'
import { Eye, EyeOff, Lock, Save, Loader2, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/useAppStore'

export default function Profile() {
  const { user } = useAppStore()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setIsUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast.success('Senha atualizada com sucesso!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao atualizar a senha.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações da sua conta e credenciais de acesso.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados da Conta
            </CardTitle>
            <CardDescription>
              Informações vinculadas ao seu perfil atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={user?.name || ''}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail de Acesso</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Usuário</Label>
              <Input
                value={user?.role?.toUpperCase() || ''}
                disabled
                className="bg-muted/50"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Trocar Senha
            </CardTitle>
            <CardDescription>
              Atualize sua senha de acesso ao sistema. Escolha uma senha forte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    required
                    disabled={isUpdating}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    disabled={isUpdating}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full gap-2 font-medium"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Atualizar Senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
