import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/useAppStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Shield, AlertTriangle, BarChart3 } from 'lucide-react'

export default function AdminDashboard() {
  const { user, selectedSchool, loading } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'administrador')) {
      navigate('/')
    }
  }, [user, loading, navigate])

  if (loading || !user || !selectedSchool) return null

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Painel do Administrador
        </h1>
        <p className="text-muted-foreground">
          Gestão da escola:{' '}
          <span className="font-semibold text-foreground">
            {selectedSchool.name}
          </span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/admin/code-of-conduct')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Código de Conduta
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar</div>
            <p className="text-xs text-muted-foreground">
              Upload e atualização
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/admin/commitment')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compromisso Alta Gestão
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar</div>
            <p className="text-xs text-muted-foreground">
              Upload e atualização
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/admin/complaints')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denúncias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ocorrências</div>
            <p className="text-xs text-muted-foreground">Visualizar e tratar</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/admin/reports')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Métricas</div>
            <p className="text-xs text-muted-foreground">Estatísticas gerais</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
