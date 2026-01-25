import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ShieldCheck,
  Megaphone,
  Search,
  Lock,
  Clock,
  ArrowRight,
  PanelLeft,
} from 'lucide-react'

const Index = () => {
  const { user, profile, loading } = useAppStore()
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
      } else if (profile === 'professor') {
        navigate('/dashboard-professor')
      } else if (profile === 'DIRETOR_COMPLIANCE') {
        navigate('/compliance/director/dashboard')
      } else if (profile === 'ANALISTA_COMPLIANCE') {
        navigate('/compliance/analyst/dashboard')
      } else if (profile === 'gestao_escola') {
        navigate('/school-management/dashboard')
      }
    }
  }, [user, profile, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 animate-fade-in">
      {/* Global Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-700/10 p-1.5 rounded-md">
            <PanelLeft className="h-5 w-5 text-emerald-800" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            ALERTIA
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/support')}>
            Suporte
          </Button>
          <Button
            onClick={() => navigate('/login')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6"
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-10 lg:py-16 space-y-10 w-full max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
          <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            ALERTIA
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Integridade, Ética e Compliance
          </p>
        </div>

        {/* Confidentiality Notice */}
        <div className="w-full max-w-xl bg-blue-50/80 border border-blue-100 text-blue-800 px-6 py-4 rounded-xl text-center shadow-sm">
          <p className="font-medium text-sm md:text-base">
            Este é um canal seguro e confidencial para proteger a comunidade
            escolar.
          </p>
        </div>

        {/* Action Cards Container */}
        <div className="w-full max-w-2xl space-y-5">
          {/* Primary Action: Report */}
          <Card
            className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-l-[6px] border-l-orange-500 bg-white"
            onClick={() => navigate('/public/complaint/new')}
          >
            <CardContent className="p-6 md:p-8 flex items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Megaphone className="h-7 w-7 text-orange-600" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                    Registrar Denúncia
                  </h2>
                  <p className="text-slate-500 text-sm md:text-base">
                    Relate irregularidades (Anônimo)
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-md mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Leva cerca de 3–5 minutos</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-full group-hover:bg-orange-50 transition-colors hidden sm:block">
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Consult Status */}
            <Card
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
              onClick={() => navigate('/public/complaint/status')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Consultar Status
                  </h3>
                  <p className="text-sm text-slate-500">
                    Acompanhe seu protocolo
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Restricted Area */}
            <Card
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
              onClick={() => navigate('/login')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Área Restrita
                  </h3>
                  <p className="text-sm text-slate-500">Acesso colaboradores</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>
          © {new Date().getFullYear()} ALERTIA. Integridade em primeiro lugar.
        </span>
        <span className="hidden sm:inline">•</span>
        <button
          onClick={() => navigate('/support')}
          className="hover:text-slate-600 transition-colors underline underline-offset-4"
        >
          Suporte
        </button>
      </footer>
    </div>
  )
}

export default Index
