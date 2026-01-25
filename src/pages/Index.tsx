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
        navigate('/senior/dashboard')
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            ALERTIA
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Plataforma de Ética, Integridade e Compliance
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-center">
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

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Acesso Público
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/public/complaint/new')}
            >
              Realizar Denúncia
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ALERTIA. Integridade em primeiro lugar.
        </p>
      </div>
    </div>
  )
}

export default Index
