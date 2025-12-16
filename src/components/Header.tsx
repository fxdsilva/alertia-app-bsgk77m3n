import { Link, useNavigate } from 'react-router-dom'
import { Building2, UserCircle, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useAppStore from '@/stores/useAppStore'

export function Header() {
  const { selectedSchool, user, logout, clearSchool } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChangeSchool = () => {
    clearSchool()
    navigate('/')
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

      <div className="flex items-center gap-4">
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
              <DropdownMenuItem>
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
            <Button variant="default">Entrar</Button>
          </Link>
        )}
      </div>
    </header>
  )
}
