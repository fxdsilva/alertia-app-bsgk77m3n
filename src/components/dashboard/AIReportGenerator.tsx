import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Loader2, FileText, Database } from 'lucide-react'
import { aiReportService } from '@/services/aiReportService'
import { adminService } from '@/services/adminService'
import { toast } from 'sonner'
import { School } from '@/lib/mockData'

export function AIReportGenerator({
  onReportGenerated,
}: {
  onReportGenerated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<string>('global')

  const [sources, setSources] = useState({
    denuncias: true,
    auditorias: true,
    treinamentos: false,
    riscos: false,
  })

  useEffect(() => {
    if (open) {
      loadSchools()
    }
  }, [open])

  const loadSchools = async () => {
    try {
      const data = await adminService.getAllSchools()
      setSchools(data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar escolas')
    }
  }

  const handleSourceChange = (key: keyof typeof sources) => {
    setSources((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleGenerate = async () => {
    const activeSources = Object.entries(sources)
      .filter(([_, v]) => v)
      .map(([k]) => k)

    if (activeSources.length === 0) {
      toast.error('Selecione pelo menos uma fonte de dados para análise.')
      return
    }

    setLoading(true)
    try {
      await aiReportService.generateReport(
        selectedSchool === 'global' ? 'global' : 'school',
        selectedSchool === 'global' ? undefined : selectedSchool,
        activeSources,
      )
      toast.success('Relatório gerado com sucesso!')
      setOpen(false)
      if (onReportGenerated) onReportGenerated()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md border-0">
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Relatório IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Gerar Relatório Inteligente
          </DialogTitle>
          <DialogDescription>
            Configure os parâmetros para a Inteligência Artificial analisar os
            dados e gerar insights estratégicos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="scope">Escopo da Análise</Label>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o escopo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Rede Completa (Global)</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              Fontes de Dados (O que a IA deve analisar)
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="src-denuncias"
                  checked={sources.denuncias}
                  onCheckedChange={() => handleSourceChange('denuncias')}
                />
                <label
                  htmlFor="src-denuncias"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Denúncias e Casos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="src-auditorias"
                  checked={sources.auditorias}
                  onCheckedChange={() => handleSourceChange('auditorias')}
                />
                <label
                  htmlFor="src-auditorias"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Auditorias
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="src-treinamentos"
                  checked={sources.treinamentos}
                  onCheckedChange={() => handleSourceChange('treinamentos')}
                />
                <label
                  htmlFor="src-treinamentos"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Treinamentos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="src-riscos"
                  checked={sources.riscos}
                  onCheckedChange={() => handleSourceChange('riscos')}
                />
                <label
                  htmlFor="src-riscos"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Matriz de Riscos
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando Dados...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
