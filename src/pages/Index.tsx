import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import { School } from '@/lib/mockData'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { portalService } from '@/services/portalService'
import { useDebounce } from '@/hooks/use-debounce'

// Simple debounce hook implementation if not available
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounceValue(searchTerm, 500)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<School | null>(null)
  const { selectSchool } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSchools = async () => {
      if (!debouncedSearchTerm) {
        setSchools([])
        return
      }

      setLoading(true)
      try {
        const results = await portalService.searchSchools(debouncedSearchTerm)
        setSchools(results)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao buscar escolas.')
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [debouncedSearchTerm])

  const handleSelect = (school: School) => {
    setSelected(school)
  }

  const handleProceed = () => {
    if (selected) {
      selectSchool(selected)
      if (selected.status === 'inativo') {
        toast.warning(
          'Escola com status inativo. Algumas funcionalidades podem estar limitadas.',
        )
      } else {
        toast.success(`Escola selecionada: ${selected.name}`)
      }
      navigate('/public/portal')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-3xl mx-auto space-y-8 animate-fade-in-up p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
          ALERTIA
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Plataforma de integridade, ética e transparência para instituições
          educacionais.
        </p>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-center">
            Selecione sua Instituição
          </CardTitle>
          <CardDescription className="text-center">
            Busque e selecione sua escola para acessar o portal de integridade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Digite o nome da escola..."
              className="pl-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-md min-h-[100px] max-h-[300px] overflow-y-auto relative">
            {loading ? (
              <div className="flex items-center justify-center h-[100px] text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Buscando...
              </div>
            ) : schools.length > 0 ? (
              <div className="divide-y">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className={cn(
                      'p-4 cursor-pointer transition-colors hover:bg-muted flex items-center justify-between',
                      selected?.id === school.id &&
                        'bg-primary/10 border-l-4 border-l-primary',
                    )}
                    onClick={() => handleSelect(school)}
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {school.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {school.modality}
                      </p>
                    </div>
                    <div className="text-xs text-right">
                      <span className="block font-medium text-primary">
                        {school.network}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          school.status === 'ativo'
                            ? 'text-green-700 bg-green-50'
                            : 'text-yellow-700 bg-yellow-50',
                        )}
                      >
                        {school.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>
                  {searchTerm
                    ? 'Nenhuma escola encontrada.'
                    : 'Digite para buscar.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full h-12 text-lg"
            disabled={!selected}
            onClick={handleProceed}
          >
            Avançar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Index
