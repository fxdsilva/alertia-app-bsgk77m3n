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
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-primary rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 ring-4 ring-white/50">
              <Shield className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tight drop-shadow-sm">
            ALERTIA
          </h1>
          <p className="mt-3 text-xl text-muted-foreground font-semibold">
            Plataforma de Ética, Integridade e Compliance
          </p>
        </div>

        <Card className="shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-slate-200 dark:border-slate-800 bg-card z-10">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl text-center font-extrabold text-foreground">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-center text-base font-medium text-muted-foreground">
              Acesse sua conta para gerenciar e monitorar os programas de
              integridade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              className="w-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 hover:brightness-110 rounded-lg"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Entrar na Plataforma
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-wider">
                  Acesso Público
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-14 text-lg font-bold border-2 border-slate-300 hover:border-slate-400 hover:bg-secondary/50 rounded-lg"
              onClick={() => navigate('/public/complaint/new')}
            >
              Realizar Denúncia
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground font-bold">
          © {new Date().getFullYear()} ALERTIA. Integridade em primeiro lugar.
        </p>
      </div>
    </div>
  )
}

export default Index
