import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, Filter } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import useAppStore from '@/stores/useAppStore'
import { schools, School } from '@/lib/mockData'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [networkFilter, setNetworkFilter] = useState<string>('all')
  const [modalityFilter, setModalityFilter] = useState<string>('all')
  const [selected, setSelected] = useState<School | null>(null)
  const { selectSchool } = useAppStore()
  const navigate = useNavigate()

  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesNetwork =
      networkFilter === 'all' || school.network === networkFilter
    const matchesModality =
      modalityFilter === 'all' || school.modality === modalityFilter
    return matchesSearch && matchesNetwork && matchesModality
  })

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
      navigate('/public/code-of-conduct')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setNetworkFilter('all')
    setModalityFilter('all')
    setSelected(null)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-3xl mx-auto space-y-8 animate-fade-in-up">
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

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="filters" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filtros Avançados
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Rede de Ensino
                    </label>
                    <Select
                      value={networkFilter}
                      onValueChange={setNetworkFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="Municipal">Municipal</SelectItem>
                        <SelectItem value="Estadual">Estadual</SelectItem>
                        <SelectItem value="Federal">Federal</SelectItem>
                        <SelectItem value="Privada">Privada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modalidade</label>
                    <Select
                      value={modalityFilter}
                      onValueChange={setModalityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="Urbana">Urbana</SelectItem>
                        <SelectItem value="Rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="px-0 mt-2 text-xs text-muted-foreground"
                >
                  Limpar Filtros
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            {filteredSchools.length > 0 ? (
              <div className="divide-y">
                {filteredSchools.map((school) => (
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
                        {school.municipality} - {school.state}
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
                <p>Nenhuma escola encontrada.</p>
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
