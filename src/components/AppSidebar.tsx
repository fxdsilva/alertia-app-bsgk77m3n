import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  AlertTriangle,
  BarChart,
  BookOpen,
  FileText,
  Gavel,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
  BrainCircuit,
  Building2,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { profile, signOut } = useAppContext()

  const isActive = (path: string) => pathname === path

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ALERTIA</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Public / Common Items */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/')}>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Início</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/public/portal')}
                >
                  <Link to="/public/portal">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Portal de Transparência</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collaborator Items */}
        {[
          'colaborador',
          'gestor',
          'alta_gestao',
          'admin_gestor',
          'administrador',
        ].includes(profile || '') && (
          <SidebarGroup>
            <SidebarGroupLabel>Colaborador</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/collaborator/training')}
                  >
                    <Link to="/collaborator/training">
                      <BookOpen className="h-4 w-4" />
                      <span>Treinamentos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/collaborator/content')}
                  >
                    <Link to="/collaborator/content">
                      <FileText className="h-4 w-4" />
                      <span>Conteúdos Internos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Manager Items */}
        {['gestor', 'alta_gestao', 'admin_gestor', 'administrador'].includes(
          profile || '',
        ) && (
          <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/manager/risks')}
                  >
                    <Link to="/manager/risks">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Gestão de Riscos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/manager/audits')}
                  >
                    <Link to="/manager/audits">
                      <FileText className="h-4 w-4" />
                      <span>Auditorias</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/manager/mediations')}
                  >
                    <Link to="/manager/mediations">
                      <Users className="h-4 w-4" />
                      <span>Mediação de Conflitos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Senior Management Items */}
        {['alta_gestao', 'administrador', 'senior'].includes(profile || '') && (
          <SidebarGroup>
            <SidebarGroupLabel>Alta Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/senior/consolidated')}
                  >
                    <Link to="/senior/consolidated">
                      <BarChart className="h-4 w-4" />
                      <span>Dados Consolidados</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/senior/due-diligence')}
                  >
                    <Link to="/senior/due-diligence">
                      <Shield className="h-4 w-4" />
                      <span>Due Diligence</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/senior/decisions')}
                  >
                    <Link to="/senior/decisions">
                      <Gavel className="h-4 w-4" />
                      <span>Decisões Disciplinares</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/senior/ai-reports')}
                  >
                    <Link to="/senior/ai-reports">
                      <BrainCircuit className="h-4 w-4" />
                      <span>Relatórios IA</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Items */}
        {['administrador', 'admin_gestor'].includes(profile || '') && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração Escolar</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/dashboard')}
                  >
                    <Link to="/admin/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Painel Administrativo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/school-admin/users')}
                  >
                    <Link to="/school-admin/users">
                      <Users className="h-4 w-4" />
                      <span>Gestão de Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/admin/complaints')}
                  >
                    <Link to="/admin/complaints">
                      <FileText className="h-4 w-4" />
                      <span>Gestão de Denúncias</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Master Admin / Senior Exclusive Items */}
        {profile === 'senior' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração Master</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/senior/schools')}
                  >
                    <Link to="/senior/schools">
                      <Building2 className="h-4 w-4" />
                      <span>Gestão de Escolas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Add other master admin items here */}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {profile && (
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
