import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LogOut,
  LayoutGrid,
  Shield,
  FileText,
  AlertTriangle,
  Settings,
  Users,
  Building2,
  PieChart,
  FileCheck,
  Scale,
  SearchCheck,
  BrainCircuit,
  MessageSquare,
  LifeBuoy,
  Menu,
  GraduationCap,
  Calendar,
  ClipboardList,
  Gavel,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/useAppStore'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationCenter } from '@/components/NotificationCenter'

const Layout = () => {
  const { user, profile, signOut, selectedSchool } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Public/Auth routes don't use the main layout with sidebar
  const isPublicRoute =
    [
      '/',
      '/login',
      '/admin/auth',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/home',
      '/about',
      '/support',
    ].includes(location.pathname) ||
    location.pathname.startsWith('/public') ||
    location.pathname === '/share' ||
    location.pathname === '/messages'

  if (isPublicRoute) {
    return <Outlet />
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const NavLink = ({
    to,
    icon: Icon,
    children,
    badge,
  }: {
    to: string
    icon: any
    children: React.ReactNode
    badge?: string
  }) => {
    const isActive =
      location.pathname === to || location.pathname.startsWith(to + '/')
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
          isActive
            ? 'bg-primary text-primary-foreground font-medium shadow-md'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            isActive
              ? 'text-white'
              : 'text-muted-foreground group-hover:text-primary',
          )}
        />
        <span className="flex-1">{children}</span>
        {badge && (
          <Badge
            variant="secondary"
            className={cn(
              'ml-auto text-[10px] h-5 px-1.5',
              isActive
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {badge}
          </Badge>
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4 bg-surface border-r border-border/40">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="bg-primary/10 p-2 rounded-xl">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-foreground">
            ALERTIA
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
            Compliance & Integridade
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent">
        {/* ROLE BASED NAVIGATION */}

        {/* SENIOR / ADMIN MASTER */}
        {profile === 'senior' && (
          <>
            <div className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider px-3 mb-2 mt-4">
              Gestão Global
            </div>
            <NavLink to="/senior/dashboard" icon={LayoutGrid}>
              Dashboard
            </NavLink>
            <NavLink to="/senior/schools" icon={Building2}>
              Escolas
            </NavLink>
            <NavLink to="/senior/users" icon={Users}>
              Usuários
            </NavLink>
            <NavLink to="/senior/consolidated" icon={Building2}>
              Dados Consolidados
            </NavLink>
            <NavLink to="/senior/due-diligence" icon={SearchCheck}>
              Due Diligence
            </NavLink>
            <NavLink to="/senior/decisions" icon={Gavel}>
              Decisões Disciplinares
            </NavLink>
            <NavLink to="/senior/ai-reports" icon={BrainCircuit}>
              Relatórios IA
            </NavLink>
            <NavLink to="/senior/audit-logs" icon={FileText}>
              Logs de Auditoria
            </NavLink>
            <NavLink to="/admin/complaints" icon={AlertTriangle}>
              Todas Denúncias
            </NavLink>
          </>
        )}

        {/* COMPLIANCE DIRECTOR */}
        {profile === 'DIRETOR_COMPLIANCE' && (
          <>
            <div className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider px-3 mb-2 mt-4">
              Diretoria
            </div>
            <NavLink to="/compliance/director/dashboard" icon={LayoutGrid}>
              Dashboard
            </NavLink>
            <NavLink to="/compliance/director/analysts" icon={Users}>
              Equipe
            </NavLink>
            <NavLink to="/compliance/director/tasks" icon={ClipboardList}>
              Atribuição de Tarefas
            </NavLink>
            <NavLink to="/compliance/director/complaints" icon={AlertTriangle}>
              Triagem de Denúncias
            </NavLink>
          </>
        )}

        {/* COMPLIANCE ANALYST */}
        {profile === 'ANALISTA_COMPLIANCE' && (
          <>
            <div className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider px-3 mb-2 mt-4">
              Operacional
            </div>
            <NavLink to="/compliance/analyst/dashboard" icon={LayoutGrid}>
              Meu Workspace
            </NavLink>
          </>
        )}

        {/* OPERATIONAL (GLOBAL) */}
        {profile === 'operacional' && (
          <>
            <NavLink to="/operational/dashboard" icon={LayoutGrid}>
              Dashboard
            </NavLink>
            <NavLink to="/operational/complaints" icon={AlertTriangle}>
              Denúncias
            </NavLink>
            <NavLink to="/operational/investigations" icon={SearchCheck}>
              Investigações
            </NavLink>
            <NavLink to="/operational/trainings" icon={GraduationCap}>
              Treinamentos
            </NavLink>
            <NavLink to="/operational/mediations" icon={Scale}>
              Mediações
            </NavLink>
          </>
        )}

        {/* SCHOOL MANAGEMENT */}
        {profile === 'gestao_escola' && (
          <>
            <NavLink to="/school-management/dashboard" icon={LayoutGrid}>
              Dashboard
            </NavLink>
            <NavLink to="/school-management/stats/complaints" icon={PieChart}>
              Estatísticas
            </NavLink>
            <NavLink to="/school-management/complaints" icon={AlertTriangle}>
              Denúncias da Escola
            </NavLink>
            <NavLink to="/admin/code-of-conduct" icon={FileText}>
              Código de Conduta
            </NavLink>
            <NavLink to="/admin/commitment" icon={Shield}>
              Compromisso
            </NavLink>
            <NavLink to="/school-admin/trainings" icon={GraduationCap}>
              Treinamentos
            </NavLink>
            <NavLink to="/admin/reports" icon={FileText}>
              Relatórios
            </NavLink>
          </>
        )}

        {/* PROFESSOR */}
        {profile === 'professor' && (
          <>
            <NavLink to="/dashboard-professor" icon={LayoutGrid}>
              Minha Área
            </NavLink>
            <NavLink to="/professor/agenda" icon={Calendar}>
              Agenda
            </NavLink>
            <NavLink to="/professor/trainings" icon={GraduationCap}>
              Treinamentos
            </NavLink>
          </>
        )}

        {/* COLLABORATOR */}
        {profile === 'colaborador' && (
          <>
            <NavLink to="/collaborator/training" icon={GraduationCap}>
              Meus Treinamentos
            </NavLink>
            <NavLink to="/collaborator/training/public-list" icon={LayoutGrid}>
              Catálogo
            </NavLink>
            <NavLink to="/collaborator/complaints" icon={MessageSquare}>
              Minhas Denúncias
            </NavLink>
          </>
        )}

        {/* SECRETARY */}
        {profile === 'SECRETARIA DE EDUCAÇÃO' && (
          <>
            <NavLink to="/secretary/dashboard" icon={LayoutGrid}>
              Visão Geral
            </NavLink>
          </>
        )}

        {/* Common Links */}
        <div className="pt-4 mt-4 border-t border-border/40">
          <NavLink to="/support" icon={LifeBuoy}>
            Suporte
          </NavLink>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border/40">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {user?.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-muted-foreground truncate capitalize">
              {profile?.replace('_', ' ')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-secondary/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shadow-md bg-surface"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-border/40 bg-surface/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0">
          <div className="lg:hidden w-8" />{' '}
          {/* Spacer for mobile menu button */}
          <div className="flex items-center gap-4 ml-auto">
            {selectedSchool &&
              profile !== 'senior' &&
              profile !== 'DIRETOR_COMPLIANCE' && (
                <div className="hidden md:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground max-w-[200px] truncate">
                    {selectedSchool.name}
                  </span>
                </div>
              )}
            <NotificationCenter />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
