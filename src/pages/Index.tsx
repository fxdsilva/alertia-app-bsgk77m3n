import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Shield, ArrowRight } from 'lucide-react'

const Index = () => {
  const { user, profile, loading } = useAppContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      if (profile === 'senior') {
        navigate('/senior/schools')
      } else if (profile === 'administrador' || profile === 'admin_gestor') {
        navigate('/admin/dashboard')
      } else if (profile === 'alta_gestao') {
        navigate('/senior/consolidated')
      } else if (profile === 'gestor') {
        navigate('/manager/risks')
      } else if (profile === 'colaborador') {
        navigate('/collaborator/training')
      }
    }
  }, [user, profile, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ALERTIA</h1>
          <p className="mt-2 text-gray-600">
            Plataforma de Ética, Integridade e Compliance
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Bem-vindo ao Portal</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar e monitorar os programas de
              integridade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Entrar na Plataforma
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Acesso Público
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/public/portal')}
            >
              Acessar Portal de Transparência
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ALERTIA. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

export default Index
