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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
            ALERTIA
          </h1>
          <p className="mt-3 text-lg text-muted-foreground font-medium">
            Plataforma de Ética, Integridade e Compliance
          </p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center text-base">
              Acesse sua conta para gerenciar e monitorar os programas de
              integridade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              className="w-full h-12 text-base font-semibold shadow-md"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Entrar na Plataforma
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">
                  Acesso Público
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 hover:bg-secondary hover:text-foreground"
              onClick={() => navigate('/public/complaint/new')}
            >
              Realizar Denúncia
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground font-medium">
          © {new Date().getFullYear()} ALERTIA. Integridade em primeiro lugar.
        </p>
      </div>
    </div>
  )
}

export default Index
