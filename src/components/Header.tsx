import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Building2,
  UserCircle,
  LogOut,
  Settings,
  Download,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useAppStore from '@/stores/useAppStore'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function Header() {
  const { selectedSchool, user, logout, clearSchool } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { isInstallable, installPWA } = usePWAInstall()

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const isPartnersPage = location.pathname === '/partners'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChangeSchool = () => {
    clearSchool()
    navigate('/')
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setUpdatingPassword(true)
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authUser.email,
          password: currentPassword,
        })
        if (signInError) {
          toast.error('Senha atual incorreta.')
          setUpdatingPassword(false)
          return
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        toast.error('Erro ao atualizar senha.')
      } else {
        toast.success('Senha atualizada com sucesso.')
        setIsPasswordModalOpen(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-2" />
        <Link
          to={selectedSchool ? '/public/code-of-conduct' : '/'}
          className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity"
        >
          <span>ALERTIA</span>
        </Link>
      </div>

      <div className="flex-1 flex justify-center">
        {selectedSchool && (
          <Button
            variant="ghost"
            className="hidden md:flex items-center gap-2 text-primary font-semibold hover:bg-primary/10"
            onClick={handleChangeSchool}
          >
            <Building2 className="h-4 w-4" />
            {selectedSchool.name}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {isPartnersPage ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full text-muted-foreground hover:bg-muted"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : null}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/support" className="hover:text-primary transition-colors">
            Suporte
          </Link>
          <Link to="/partners" className="hover:text-primary transition-colors">
            Parceiros
          </Link>
        </nav>
        {isInstallable && (
          <Button
            variant="outline"
            size="sm"
            onClick={installPWA}
            className="hidden sm:flex items-center gap-2 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
          >
            <Download className="h-4 w-4" />
            Instalar App
          </Button>
        )}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground capitalize">
                {user.role}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleChangeSchool}>
                <Building2 className="mr-2 h-4 w-4" />
                Mudar Escola
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsPasswordModalOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Minha Conta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 font-medium">
              Entrar
            </Button>
          </Link>
        )}
      </div>

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Minha Conta</DialogTitle>
            <DialogDescription>
              Atualize sua senha de acesso ao sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={updatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={updatingPassword}
                placeholder="Mínimo de 8 caracteres"
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
                disabled={updatingPassword}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={updatingPassword}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updatingPassword}>
                {updatingPassword && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
