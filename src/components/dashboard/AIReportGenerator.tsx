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
import { Sparkles, Loader2, FileText } from 'lucide-react'
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

  const handleGenerate = async () => {
    setLoading(true)
    try {
      await aiReportService.generateReport(
        selectedSchool === 'global' ? 'global' : 'school',
        selectedSchool === 'global' ? undefined : selectedSchool,
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
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Relatório IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Gerar Relatório Inteligente
          </DialogTitle>
          <DialogDescription>
            A IA analisará os dados de compliance e integridade para gerar
            insights estratégicos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
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
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
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
