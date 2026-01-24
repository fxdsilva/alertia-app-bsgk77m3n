import { useNavigate } from 'react-router-dom'
import { FileText, Shield, AlertTriangle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useAppStore from '@/stores/useAppStore'
import { useEffect } from 'react'

export default function PortalHome() {
  const { selectedSchool } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!selectedSchool) {
      navigate('/')
    }
  }, [selectedSchool, navigate])

  if (!selectedSchool) return null

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background text-foreground p-6 animate-fade-in">
      <div className="w-full max-w-md space-y-8 flex flex-col h-full">
        <div className="text-center space-y-2 mt-8">
          <h1 className="text-3xl font-bold tracking-wider text-foreground/80">
            PORTAL DE
          </h1>
          <h1 className="text-4xl font-extrabold tracking-wider text-primary">
            INTEGRIDADE
          </h1>
          <p className="text-sm font-medium opacity-80 mt-2 text-muted-foreground">
            {selectedSchool.name}
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-5 justify-center py-8">
          <Button
            className="h-28 text-lg font-bold bg-card hover:bg-secondary text-foreground border-2 border-primary/20 hover:border-primary shadow-sm hover:shadow-md flex items-center justify-start px-8 gap-5 transition-all duration-300 rounded-xl"
            onClick={() => navigate('/public/commitment')}
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left leading-tight">
              COMPROMISSO
              <br />
              DA ALTA GESTÃO
            </div>
          </Button>

          <Button
            className="h-28 text-lg font-bold bg-card hover:bg-secondary text-foreground border-2 border-primary/20 hover:border-primary shadow-sm hover:shadow-md flex items-center justify-start px-8 gap-5 transition-all duration-300 rounded-xl"
            onClick={() => navigate('/public/code-of-conduct')}
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left leading-tight">
              CÓDIGO DE
              <br />
              CONDUTA DA
              <br />
              INSTITUIÇÃO
            </div>
          </Button>

          <Button
            className="h-28 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg flex items-center justify-start px-8 gap-5 transition-all duration-300 rounded-xl"
            onClick={() => navigate('/public/complaint/new')}
          >
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div className="text-left leading-tight">
              FAÇA SUA
              <br />
              DENÚNCIA
            </div>
          </Button>
        </div>

        <div className="mt-auto pb-6 text-center">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-primary hover:bg-transparent gap-2 font-medium"
            onClick={() => navigate('/login')}
          >
            Área Restrita <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
