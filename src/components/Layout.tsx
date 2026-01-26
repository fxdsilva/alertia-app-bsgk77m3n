import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LogOut,
  LayoutGrid,
  Shield,
  FileText,
  AlertTriangle,
  Users,
  Building2,
  PieChart,
  FileCheck,
  Scale,
  SearchCheck,
  BrainCircuit,
  LifeBuoy,
  Menu,
  GraduationCap,
  Gavel,
  Home,
  Share2,
  MessageSquare,
  Info,
  BarChart3,
  GitPullRequest,
  Settings,
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
      '/support', // Support is now public
      '/admin/auth',
      '/auth/forgot-password',
      '/auth/reset-password',
    ].includes(location.pathname) || location.pathname.startsWith('/public')

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
          'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative border border-transparent',
          isActive
            ? 'bg-primary text-primary-foreground font-semibold shadow-sm border-primary/10'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-border/30',
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            isActive
              ? 'text-primary-foreground'
              : 'text-foreground/70 group-hover:text-primary',
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
                : 'bg-muted text-foreground',
            )}
          >
            {badge}
          </Badge>
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4 bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="bg-primary p-2.5 rounded-xl shadow-sm">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-sidebar-foreground">
            ALERTIA
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
            Compliance & Integridade
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent">
        {/* ROLE BASED NAVIGATION */}

        {/* SENIOR / ADMIN MASTER */}
        {profile === 'senior' && (
          <>
            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              Gestão Global
            </div>
            <NavLink to="/senior/dashboard" icon={LayoutGrid}>
              Dashboard
            </NavLink>
            <NavLink to="/senior/workflow" icon={GitPullRequest}>
              Workflow de Rede
            </NavLink>
            <NavLink to="/senior/schools" icon={Building2}>
              Escolas
            </NavLink>
            <NavLink to="/senior/users" icon={Users}>
              Usuários
            </NavLink>
            <NavLink to="/senior/pending-reports" icon={AlertTriangle}>
              Denúncias Pendentes
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
            <NavLink to="/senior/support-config" icon={Settings}>
              Configuração Suporte
            </NavLink>
          </>
        )}

        {/* COMPLIANCE DIRECTOR */}
        {profile === 'DIRETOR_COMPLIANCE' && (
          <>
            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              Diretoria
            </div>
            <NavLink to="/compliance/director/dashboard" icon={LayoutGrid}>
              Dashboard
            </NavLink>
            <NavLink to="/compliance/director/workflow" icon={GitPullRequest}>
              Workflow
            </NavLink>
            <NavLink to="/compliance/director/analysts" icon={Users}>
              Equipe
            </NavLink>
            <NavLink to="/compliance/director/tasks" icon={FileText}>
              Tarefas
            </NavLink>
            <NavLink to="/senior/pending-reports" icon={AlertTriangle}>
              Denúncias Pendentes
            </NavLink>
          </>
        )}

        {/* COMPLIANCE ANALYST */}
        {profile === 'ANALISTA_COMPLIANCE' && (
          <>
            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              Operacional
            </div>
            <NavLink to="/compliance/analyst/dashboard" icon={LayoutGrid}>
              Dashboard
            </NavLink>
            <NavLink to="/compliance/analyst/complaints" icon={AlertTriangle}>
              Denúncias
            </NavLink>
            <NavLink to="/compliance/analyst/auditing" icon={FileCheck}>
              Auditorias
            </NavLink>
            <NavLink to="/compliance/analyst/due-diligence" icon={SearchCheck}>
              Due Diligence
            </NavLink>
            <NavLink to="/compliance/analyst/risk-management" icon={PieChart}>
              Riscos
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

        {/* SCHOOL MANAGEMENT (GESTOR ESCOLAR) */}
        {profile === 'gestao_escola' && (
          <>
            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              Gestão da Escola
            </div>
            <NavLink to="/school-management/dashboard" icon={LayoutGrid}>
              Dashboard Estratégico
            </NavLink>

            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              Módulos
            </div>
            <NavLink to="/admin/code-of-conduct" icon={FileText}>
              Código de Conduta
            </NavLink>
            <NavLink to="/collaborator/training" icon={GraduationCap}>
              Treinamentos
            </NavLink>
            <NavLink to="/school-admin/complaints" icon={AlertTriangle}>
              Denúncias
            </NavLink>
            <NavLink to="/admin/reports" icon={BarChart3}>
              Relatórios
            </NavLink>
            <NavLink to="/admin/commitment" icon={Shield}>
              Compromisso Gestão
            </NavLink>
            <NavLink to="/manager/risks" icon={PieChart}>
              Gestão de Riscos
            </NavLink>
            <NavLink to="/manager/audits" icon={FileCheck}>
              Auditorias
            </NavLink>
            <NavLink to="/manager/mediations" icon={Scale}>
              Mediação de Conflitos
            </NavLink>
            <NavLink to="/senior/due-diligence" icon={SearchCheck}>
              Due Diligence
            </NavLink>
            <NavLink to="/senior/decisions" icon={Gavel}>
              Decisões Disciplinares
            </NavLink>
            <NavLink to="/senior/consolidated" icon={Building2}>
              Visão Consolidada
            </NavLink>
            <NavLink to="/senior/ai-reports" icon={BrainCircuit}>
              Relatórios IA
            </NavLink>

            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              Menu Principal
            </div>
            <NavLink to="/home" icon={Home}>
              Início
            </NavLink>
            <NavLink to="/share" icon={Share2}>
              Compartilhar App
            </NavLink>
            <NavLink to="/messages" icon={MessageSquare}>
              Mensagens
            </NavLink>
            <NavLink to="/support" icon={LifeBuoy}>
              Suporte
            </NavLink>
            <NavLink to="/about" icon={Info}>
              Sobre
            </NavLink>
          </>
        )}

        {/* PROFESSOR */}
        {profile === 'professor' && (
          <>
            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              Módulos
            </div>
            <NavLink to="/professor/trainings" icon={GraduationCap}>
              Treinamentos
            </NavLink>
            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              Menu Principal
            </div>
            <NavLink to="/dashboard-professor" icon={Home}>
              Início
            </NavLink>
            <NavLink to="/share" icon={Share2}>
              Compartilhar App
            </NavLink>
            <NavLink to="/messages" icon={MessageSquare}>
              Mensagens
            </NavLink>
            <NavLink to="/support" icon={LifeBuoy}>
              Suporte
            </NavLink>
            <NavLink to="/about" icon={Info}>
              Sobre
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
          </>
        )}

        {/* SECRETARY OF EDUCATION */}
        {profile === 'SECRETARIA DE EDUCAÇÃO' && (
          <>
            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              SECRETARIA DE EDUCAÇÃO
            </div>
            <NavLink to="/secretary/dashboard" icon={LayoutGrid}>
              Visão Geral
            </NavLink>
            <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2 mt-4">
              MENU PRINCIPAL
            </div>
            <NavLink to="/home" icon={Home}>
              Início
            </NavLink>
            <NavLink to="/share" icon={Share2}>
              Compartilhar App
            </NavLink>
            <NavLink to="/messages" icon={MessageSquare}>
              Mensagens
            </NavLink>
            <NavLink to="/support" icon={LifeBuoy}>
              Suporte
            </NavLink>
            <NavLink to="/about" icon={Info}>
              Sobre
            </NavLink>
          </>
        )}

        {/* Common Links - Excluded for Professor/Gestao Escola/Secretary as they have their own menu items in section */}
        {profile !== 'professor' &&
          profile !== 'gestao_escola' &&
          profile !== 'SECRETARIA DE EDUCAÇÃO' && (
            <div className="pt-4 mt-4 border-t border-sidebar-border">
              <NavLink to="/support" icon={LifeBuoy}>
                Suporte
              </NavLink>
            </div>
          )}
      </div>

      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-10 w-10 border-2 border-sidebar-border">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {user?.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-sidebar-foreground">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-muted-foreground truncate capitalize font-medium">
              {profile?.replace('_', ' ')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 h-full shadow-sm z-20">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shadow-md bg-card border-border"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0 shadow-sm">
          <div className="lg:hidden w-8" />{' '}
          {/* Spacer for mobile menu button */}
          <div className="flex items-center gap-4 ml-auto">
            {selectedSchool &&
              profile !== 'senior' &&
              profile !== 'DIRETOR_COMPLIANCE' &&
              profile !== 'SECRETARIA DE EDUCAÇÃO' && (
                <div className="hidden md:flex items-center gap-2 bg-secondary px-4 py-2 rounded-full border border-border">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground max-w-[200px] truncate">
                    {selectedSchool.name}
                  </span>
                </div>
              )}
            <NotificationCenter />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent bg-background">
          <div className="container mx-auto max-w-7xl p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
