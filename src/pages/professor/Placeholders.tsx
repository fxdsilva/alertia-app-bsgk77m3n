import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Construction } from 'lucide-react'

export function ProfessorShare() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-fade-in">
      <Construction className="h-16 w-16 text-muted-foreground/50" />
      <h2 className="text-2xl font-bold">Compartilhar App</h2>
      <p className="text-muted-foreground">Em breve</p>
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>
    </div>
  )
}

export function ProfessorMessages() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-fade-in">
      <Construction className="h-16 w-16 text-muted-foreground/50" />
      <h2 className="text-2xl font-bold">Mensagens</h2>
      <p className="text-muted-foreground">Em breve</p>
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>
    </div>
  )
}

export function ProfessorAbout() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-fade-in">
      <Construction className="h-16 w-16 text-muted-foreground/50" />
      <h2 className="text-2xl font-bold">Sobre o ALERTIA</h2>
      <p className="text-muted-foreground">Versão 0.0.259</p>
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
      </Button>
    </div>
  )
}
