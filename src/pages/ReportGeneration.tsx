import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAppStore from '@/stores/useAppStore'

export default function ReportGeneration() {
  const { user } = useAppStore()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Geração de Relatórios</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Configurar Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Relatório</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="denuncias">Denúncias (Geral)</SelectItem>
                <SelectItem value="treinamentos">
                  Adesão a Treinamentos
                </SelectItem>
                <SelectItem value="riscos">Matriz de Riscos</SelectItem>
                {(user?.role === 'admin_gestor' ||
                  user?.role === 'administrador') && (
                  <SelectItem value="usuarios">
                    Atividade de Usuários
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Últimos 30 dias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Último Trimestre</SelectItem>
                <SelectItem value="365">Último Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full">Gerar PDF</Button>
        </CardContent>
      </Card>
    </div>
  )
}
