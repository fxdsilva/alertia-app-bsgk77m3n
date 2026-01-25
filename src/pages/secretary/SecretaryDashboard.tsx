import { useEffect, useState } from 'react'
import {
  Search,
  Filter,
  School,
  AlertTriangle,
  FileCheck,
  Scale,
  GraduationCap,
  LayoutGrid,
  ChevronRight,
  MapPin,
  Building2,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { secretaryService, SchoolMetric } from '@/services/secretaryService'
import { toast } from 'sonner'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'

export default function SecretaryDashboard() {
  const { profile, loading: appLoading, user } = useAppStore()
  const navigate = useNavigate()

  const [data, setData] = useState<SchoolMetric[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [networkFilter, setNetworkFilter] = useState<string>('all')
  const [sphereFilter, setSphereFilter] = useState<string>('all')
  const [addressFilter, setAddressFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  useEffect(() => {
    // Role Check
    if (!appLoading && profile !== 'SECRETARIA DE EDUCAÇÃO') {
      navigate('/') // Or show access denied
    }
  }, [appLoading, profile, navigate])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const dashboardData = await secretaryService.getDashboardData()
      setData(dashboardData.schools)
    } catch (error) {
      toast.error('Erro ao carregar dados do painel')
    } finally {
      setLoading(false)
    }
  }

  // Filter Logic
  const filteredSchools = data.filter((school) => {
    const matchesNetwork =
      networkFilter === 'all' ||
      school.network.toLowerCase() === networkFilter.toLowerCase()

    const matchesSphere =
      sphereFilter === 'all' ||
      school.sphere.toLowerCase() === sphereFilter.toLowerCase()

    const matchesAddress =
      addressFilter === '' ||
      school.address.toLowerCase().includes(addressFilter.toLowerCase()) ||
      school.municipality.toLowerCase().includes(addressFilter.toLowerCase())

    const matchesSearch =
      searchFilter === '' ||
      school.name.toLowerCase().includes(searchFilter.toLowerCase())

    return matchesNetwork && matchesSphere && matchesAddress && matchesSearch
  })

  // Aggregate KPI based on filtered data
  const kpi = {
    schools: filteredSchools.length,
    complaints: filteredSchools.reduce(
      (acc, curr) => acc + curr.complaintsCount,
      0,
    ),
    investigations: filteredSchools.reduce(
      (acc, curr) => acc + curr.investigationsCount,
      0,
    ),
    mediations: filteredSchools.reduce(
      (acc, curr) => acc + curr.mediationsCount,
      0,
    ),
    trainings: filteredSchools.reduce(
      (acc, curr) => acc + curr.trainingsCount,
      0,
    ),
  }

  if (appLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (profile !== 'SECRETARIA DE EDUCAÇÃO') return null

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 animate-fade-in">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <LayoutGrid className="h-6 w-6 text-indigo-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Painel Secretaria de Educação
                </h1>
                <p className="text-sm text-slate-500">
                  Monitoramento consolidado da rede de ensino
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Secretaria de Educação
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <Filter className="h-5 w-5" />
            <h2>Filtros de Rede</h2>
          </div>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={networkFilter} onValueChange={setNetworkFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Todas as Redes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Redes</SelectItem>
                  <SelectItem value="Municipal">Municipal</SelectItem>
                  <SelectItem value="Estadual">Estadual</SelectItem>
                  <SelectItem value="Federal">Federal</SelectItem>
                  <SelectItem value="Particular">Particular</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sphereFilter} onValueChange={setSphereFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Todas as Esferas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Esferas</SelectItem>
                  <SelectItem value="Pública">Pública</SelectItem>
                  <SelectItem value="Privada">Privada</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Filtrar por Bairro/Endereço"
                  className="pl-9 bg-slate-50 border-slate-200"
                  value={addressFilter}
                  onChange={(e) => setAddressFilter(e.target.value)}
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar Escola..."
                  className="pl-9 bg-slate-50 border-slate-200"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-indigo-50 border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <School className="h-8 w-8 text-indigo-600 mb-1" />
              <div className="text-3xl font-bold text-indigo-900">
                {kpi.schools}
              </div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                Escolas Filtradas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-orange-600 mb-1" />
              <div className="text-3xl font-bold text-orange-900">
                {kpi.complaints}
              </div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                Denúncias Ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <FileCheck className="h-8 w-8 text-blue-600 mb-1" />
              <div className="text-3xl font-bold text-blue-900">
                {kpi.investigations}
              </div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Investigações
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <Scale className="h-8 w-8 text-purple-600 mb-1" />
              <div className="text-3xl font-bold text-purple-900">
                {kpi.mediations}
              </div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                Mediações
              </p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <GraduationCap className="h-8 w-8 text-emerald-600 mb-1" />
              <div className="text-3xl font-bold text-emerald-900">
                {kpi.trainings}
              </div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                Treinamentos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Schools Table */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-slate-900">
              Desempenho por Escola
            </h2>
            <p className="text-sm text-slate-500">
              Lista detalhada das instituições conforme filtros aplicados.
            </p>
          </div>

          <Card className="border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[400px] font-bold text-slate-700 uppercase text-xs">
                      Instituição
                    </TableHead>
                    <TableHead className="font-bold text-slate-700 uppercase text-xs">
                      Rede / Esfera
                    </TableHead>
                    <TableHead className="font-bold text-slate-700 uppercase text-xs">
                      Localização
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 uppercase text-xs">
                      Denúncias
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 uppercase text-xs">
                      Investig.
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-slate-500"
                      >
                        Nenhuma escola encontrada com os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map((school) => (
                      <TableRow
                        key={school.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <TableCell className="font-semibold text-slate-800">
                          {school.name.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-white text-slate-600 border-slate-200"
                            >
                              {school.sphere}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              ({school.network})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 uppercase">
                          {school.address
                            ? school.address
                            : 'ENDEREÇO NÃO CADASTRADO'}
                        </TableCell>
                        <TableCell className="text-center">
                          {school.complaintsCount > 0 ? (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                              {school.complaintsCount}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-sm">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {school.investigationsCount > 0 ? (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                              {school.investigationsCount}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-sm">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
