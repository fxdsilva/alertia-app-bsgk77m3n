import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function RestrictedAccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in-up">
      <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-3xl font-bold mb-2 text-foreground">
        Acesso Restrito
      </h1>
      <p className="text-muted-foreground mb-8">
        Você não tem permissão para visualizar.
      </p>
      <Button asChild>
        <Link to="/home">Voltar ao Início</Link>
      </Button>
    </div>
  )
}
