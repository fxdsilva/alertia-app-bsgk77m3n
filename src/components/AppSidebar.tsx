import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Home,
  Share2,
  MessageSquare,
  LifeBuoy,
  Info,
  LogOut,
  School,
  LayoutDashboard,
  Users,
  FileText,
  History,
  ShieldCheck,
  BrainCircuit,
  GraduationCap,
  AlertTriangle,
  BarChart3,
  Shield,
  PieChart,
  FileCheck,
  Scale,
  SearchCheck,
  Gavel,
  Building2,
  Briefcase,
  ShieldAlert,
  ClipboardList,
  UserCog,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ModuleKey } from '@/lib/rbac'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { user, logout, profile, hasAccess } = useAppStore()

  if (!user) return null

  const isMasterAdmin = profile === 'senior'
  const isOperational = profile === 'operacional'
  const isSecretary = profile === 'SECRETARIA DE EDUCAÇÃO'
  const isSchoolManagement = profile === 'gestao_escola'
  const isProfessor = profile === 'professor'
  const isDirector = profile === 'DIRETOR_COMPLIANCE'
  const isAnalyst = profile === 'ANALISTA_COMPLIANCE'

  const moduleLinks: {
    key: ModuleKey
    title: string
    url: string
    icon: any
  }[] = [
    {
      key: 'CODIGO_CONDUTA',
      title: 'Código de Conduta',
      url:
        isSchoolManagement || isMasterAdmin
          ? '/admin/code-of-conduct'
          : '/public/code-of-conduct',
      icon: FileText,
    },
    {
      key: 'TREINAMENTOS',
      title: 'Treinamentos',
      url: isProfessor ? '/professor/trainings' : '/collaborator/training',
      icon: GraduationCap,
    },
    {
      key: 'DENUNCIAS',
      title: 'Denúncias',
      url: isSchoolManagement
        ? '/school-management/stats/complaints'
        : '/admin/complaints',
      icon: AlertTriangle,
    },
    {
      key: 'RELATORIOS',
      title: 'Relatórios',
      url: '/admin/reports',
      icon: BarChart3,
    },
    {
      key: 'COMPROMISSO_ALTA_GESTAO',
      title: 'Compromisso Gestão',
      url:
        isSchoolManagement || isMasterAdmin
          ? '/admin/commitment'
          : '/public/commitment',
      icon: Shield,
    },
    {
      key: 'GESTAO_RISCOS',
      title: 'Gestão de Riscos',
      url: '/manager/risks',
      icon: PieChart,
    },
    {
      key: 'AUDITORIAS',
      title: 'Auditorias',
      url: '/manager/audits',
      icon: FileCheck,
    },
    {
      key: 'MEDIACAO_CONFLITOS',
      title: 'Mediação de Conflitos',
      url: '/manager/mediations',
      icon: Scale,
    },
    {
      key: 'DUE_DILIGENCE',
      title: 'Due Diligence',
      url: '/senior/due-diligence',
      icon: SearchCheck,
    },
    {
      key: 'DECISOES_DISCIPLINARES',
      title: 'Decisões Disciplinares',
      url: '/senior/decisions',
      icon: Gavel,
    },
    {
      key: 'VISAO_CONSOLIDADA',
      title: 'Visão Consolidada',
      url: '/senior/consolidated',
      icon: Building2,
    },
    {
      key: 'RELATORIOS_IA',
      title: 'Relatórios IA',
      url: '/senior/ai-reports',
      icon: BrainCircuit,
    },
  ]

  const baseItems = [
    { title: 'Início', url: '/home', icon: Home },
    { title: 'Compartilhar App', url: '/share', icon: Share2 },
    { title: 'Mensagens', url: '/messages', icon: MessageSquare },
    { title: 'Suporte', url: '/support', icon: LifeBuoy },
    { title: 'Sobre', url: '/about', icon: Info },
  ]

  return (
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-border/40 bg-primary/5">
        <Link to="/home" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
            A
          </div>
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            ALERTIA
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        {/* Compliance Director Menu */}
        {isDirector && (
          <SidebarGroup className="mb-4">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Diretoria de Compliance
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/compliance/director/dashboard'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/compliance/director/dashboard'
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/compliance/director/dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-sm">Visão Geral</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/compliance/director/tasks'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/compliance/director/tasks'
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/compliance/director/tasks">
                      <ClipboardList className="h-5 w-5" />
                      <span className="text-sm">Distribuição de Tarefas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/compliance/director/analysts'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/compliance/director/analysts'
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/compliance/director/analysts">
                      <UserCog className="h-5 w-5" />
                      <span className="text-sm">Gestão de Analistas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Compliance Analyst Menu */}
        {isAnalyst && (
          <SidebarGroup className="mb-4">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Área do Analista
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/compliance/analyst/dashboard'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/compliance/analyst/dashboard'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/compliance/analyst/dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-sm">Minhas Tarefas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Master Menu */}
        {isMasterAdmin && (
          <SidebarGroup className="mb-4">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Administração Master
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/senior/dashboard'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === '/senior/dashboard'
                        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/senior/dashboard">
                      <LayoutDashboard className="h-5 w-5 text-purple-600" />
                      <span className="text-sm">Dashboard Global</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* RLS Audit Dashboard Link */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin/audit'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === '/admin/audit'
                        ? 'bg-red-100 text-red-700 font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/admin/audit">
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                      <span className="text-sm">Auditoria & Segurança</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/senior/schools'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === '/senior/schools'
                        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/senior/schools">
                      <School className="h-5 w-5 text-purple-600" />
                      <span className="text-sm">Gestão de Escolas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/senior/users'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === '/senior/users'
                        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/senior/users">
                      <Users className="h-5 w-5 text-purple-600" />
                      <span className="text-sm">Gestão de Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/senior/operational-team'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === '/senior/operational-team'
                        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/senior/operational-team">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <span className="text-sm">Equipe Operacional</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/senior/reports'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === '/senior/reports'
                        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/senior/reports">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span className="text-sm">Relatórios Master</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/senior/audit-logs'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === '/senior/audit-logs'
                        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/senior/audit-logs">
                      <History className="h-5 w-5 text-purple-600" />
                      <span className="text-sm">Logs de Sistema</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/senior/admin-masters'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      pathname === '/senior/admin-masters'
                        ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/senior/admin-masters">
                      <ShieldCheck className="h-5 w-5 text-purple-600" />
                      <span className="text-sm">Admin Master</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Operational Menu */}
        {isOperational && (
          <SidebarGroup className="mb-4">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Gestão Operacional
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/operational/dashboard'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/operational/dashboard'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/operational/dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-sm">Painel Central</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/operational/code-of-conduct'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/operational/code-of-conduct'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/operational/code-of-conduct">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm">Código de Conduta</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/operational/complaints'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/operational/complaints'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/operational/complaints">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-sm">Denúncias</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/operational/investigations'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/operational/investigations'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/operational/investigations">
                      <FileCheck className="h-5 w-5" />
                      <span className="text-sm">Investigações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/operational/due-diligence'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/operational/due-diligence'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/operational/due-diligence">
                      <SearchCheck className="h-5 w-5" />
                      <span className="text-sm">Due Diligence</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/operational/trainings'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/operational/trainings'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/operational/trainings">
                      <GraduationCap className="h-5 w-5" />
                      <span className="text-sm">Treinamentos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/operational/mediations'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/operational/mediations'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/operational/mediations">
                      <Scale className="h-5 w-5" />
                      <span className="text-sm">Mediações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Secretary of Education Menu */}
        {isSecretary && (
          <SidebarGroup className="mb-4">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Secretaria de Educação
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/secretary/dashboard'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/secretary/dashboard'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    <Link to="/secretary/dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-sm">Visão Geral</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* School Management (Gestão Escola) Menu */}
        {isSchoolManagement && (
          <SidebarGroup className="mb-4">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Gestão da Escola
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/school-management/dashboard'}
                    className={cn(
                      'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all',
                      pathname === '/school-management/dashboard'
                        ? 'bg-primary/10 text-primary font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Link to="/school-management/dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-sm">Dashboard Estratégico</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Dynamic Modules based on Permissions (School Context) */}
        {!isMasterAdmin &&
          !isOperational &&
          !isSecretary &&
          !isDirector &&
          !isAnalyst && (
            <SidebarGroup className="mb-4">
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Módulos
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {moduleLinks.map((mod) => {
                    if (hasAccess(mod.key)) {
                      let linkUrl = mod.url
                      if (
                        mod.key === 'DENUNCIAS' &&
                        ['colaborador', 'professor'].includes(profile || '')
                      ) {
                        linkUrl = '/public/complaint/new'
                      }

                      const isActive =
                        pathname === linkUrl ||
                        (linkUrl !== '/home' && pathname.startsWith(linkUrl))
                      return (
                        <SidebarMenuItem key={mod.key}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                              isActive
                                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                            )}
                          >
                            <Link to={linkUrl}>
                              <mod.icon
                                className={cn(
                                  'h-5 w-5',
                                  isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground',
                                )}
                              />
                              <span className="text-sm">{mod.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    }
                    return null
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {baseItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                          )}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/40 space-y-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
