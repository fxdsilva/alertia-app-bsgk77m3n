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
  SidebarRail,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Link, useLocation } from 'react-router-dom'
import useAppStore from '@/stores/useAppStore'
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Search,
  GraduationCap,
  FolderOpen,
  BarChart3,
  ClipboardCheck,
  Users,
  PieChart,
  FileSearch,
  Gavel,
  School,
  FileBarChart,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const { user, selectedSchool } = useAppStore()
  const location = useLocation()
  const pathname = location.pathname

  if (!selectedSchool) return null

  const publicItems = [
    {
      title: 'Código de Conduta',
      url: '/public/code-of-conduct',
      icon: FileText,
    },
    { title: 'Compromisso', url: '/public/commitment', icon: ShieldCheck },
    {
      title: 'Nova Denúncia',
      url: '/public/complaint/new',
      icon: AlertTriangle,
    },
    {
      title: 'Acompanhar Denúncia',
      url: '/public/complaint/status',
      icon: Search,
    },
  ]

  const collaboratorItems = [
    {
      title: 'Treinamentos',
      url: '/collaborator/training',
      icon: GraduationCap,
    },
    {
      title: 'Conteúdos Internos',
      url: '/collaborator/content',
      icon: FolderOpen,
    },
    {
      title: 'Minhas Denúncias',
      url: '/collaborator/complaints',
      icon: Search,
    },
  ]

  const managerItems = [
    { title: 'Dashboard de Riscos', url: '/manager/risks', icon: BarChart3 },
    { title: 'Auditorias', url: '/manager/audits', icon: ClipboardCheck },
    { title: 'Mediações', url: '/manager/mediations', icon: Users },
  ]

  const seniorItems = [
    {
      title: 'Dados Consolidados',
      url: '/senior/consolidated',
      icon: PieChart,
    },
    { title: 'Due Diligence', url: '/senior/due-diligence', icon: FileSearch },
    { title: 'Decisões Disciplinares', url: '/senior/decisions', icon: Gavel },
    { title: 'Relatórios IA', url: '/senior/ai-reports', icon: BarChart3 },
    { title: 'Gestão de Escolas', url: '/senior/schools', icon: School },
  ]

  const sharedItems = [
    { title: 'Investigações', url: '/investigations', icon: Search },
    { title: 'Relatórios', url: '/reports', icon: FileBarChart },
  ]

  const isActive = (url: string) => pathname === url

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-sidebar-background text-sidebar-foreground py-4">
        <div className="flex items-center justify-center font-bold text-2xl tracking-tighter">
          AL
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar-background text-sidebar-foreground">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Público
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                    className={cn(
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive(item.url) &&
                        'bg-sidebar-primary text-sidebar-primary-foreground',
                    )}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && ['collaborator', 'manager', 'senior'].includes(user.role) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              Colaborador
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {collaboratorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                      className={cn(
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive(item.url) &&
                          'bg-sidebar-primary text-sidebar-primary-foreground',
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user && ['manager', 'senior'].includes(user.role) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              Gestão
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                      className={cn(
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive(item.url) &&
                          'bg-sidebar-primary text-sidebar-primary-foreground',
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {sharedItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                      className={cn(
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive(item.url) &&
                          'bg-sidebar-primary text-sidebar-primary-foreground',
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user && ['senior'].includes(user.role) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              Alta Gestão
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {seniorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                      className={cn(
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive(item.url) &&
                          'bg-sidebar-primary text-sidebar-primary-foreground',
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="bg-sidebar-background">
        <div className="p-4 text-xs text-sidebar-foreground/50 text-center">
          v0.0.1
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
