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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#0f2e5a] text-white p-6 animate-fade-in">
      <div className="w-full max-w-md space-y-8 flex flex-col h-full">
        <div className="text-center space-y-2 mt-8">
          <h1 className="text-3xl font-bold tracking-wider">PORTAL DE</h1>
          <h1 className="text-4xl font-extrabold tracking-wider text-white">
            INTEGRIDADE
          </h1>
          <p className="text-sm opacity-80 mt-2">{selectedSchool.name}</p>
        </div>

        <div className="flex-1 flex flex-col gap-4 justify-center py-8">
          <Button
            className="h-24 text-lg font-semibold bg-[#8faecb] hover:bg-[#7a9bb8] text-[#0f2e5a] shadow-lg flex items-center justify-start px-6 gap-4"
            onClick={() => navigate('/public/commitment')}
          >
            <Shield className="h-10 w-10 shrink-0" />
            <div className="text-left leading-tight">
              COMPROMISSO
              <br />
              DA ALTA GESTÃO
            </div>
          </Button>

          <Button
            className="h-24 text-lg font-semibold bg-[#8faecb] hover:bg-[#7a9bb8] text-[#0f2e5a] shadow-lg flex items-center justify-start px-6 gap-4"
            onClick={() => navigate('/public/code-of-conduct')}
          >
            <FileText className="h-10 w-10 shrink-0" />
            <div className="text-left leading-tight">
              CÓDIGO DE
              <br />
              CONDUTA DA
              <br />
              INSTITUIÇÃO
            </div>
          </Button>

          <Button
            className="h-24 text-lg font-semibold bg-white hover:bg-gray-100 text-[#0f2e5a] shadow-lg flex items-center justify-start px-6 gap-4"
            onClick={() => navigate('/public/complaint/new')}
          >
            <AlertTriangle className="h-10 w-10 shrink-0 text-[#8faecb]" />
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
            className="text-white hover:text-white/80 hover:bg-transparent gap-2"
            onClick={() => navigate('/login')}
          >
            Veja mais <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
