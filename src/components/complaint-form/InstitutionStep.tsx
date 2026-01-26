import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Check,
  ChevronsUpDown,
  FileSearch,
  FileText,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { portalService, DocumentRecord } from '@/services/portalService'
import { School } from '@/lib/mockData'
import { CATEGORY_GROUPS } from './constants'

interface InstitutionStepProps {
  schools: School[]
  loadingSchools: boolean
  selectedSchool?: School | null
}

export function InstitutionStep({
  schools,
  loadingSchools,
  selectedSchool,
}: InstitutionStepProps) {
  const { control, setValue, watch } = useFormContext()
  const [openSchool, setOpenSchool] = useState(false)
  const [openCategory, setOpenCategory] = useState(false)

  const [documents, setDocuments] = useState<{
    code: DocumentRecord | null
    commitment: DocumentRecord | null
  }>({ code: null, commitment: null })
  const [loadingDocs, setLoadingDocs] = useState(false)

  const selectedSchoolId = watch('escola_id')

  useEffect(() => {
    const fetchDocs = async () => {
      if (!selectedSchoolId) {
        setDocuments({ code: null, commitment: null })
        return
      }
      setLoadingDocs(true)
      try {
        const [code, commitment] = await Promise.all([
          portalService.getCodeOfConduct(selectedSchoolId),
          portalService.getManagementCommitment(selectedSchoolId),
        ])
        setDocuments({ code, commitment })
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setLoadingDocs(false)
      }
    }

    fetchDocs()
  }, [selectedSchoolId])

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
          <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
            1
          </span>
          Instituição e Contexto
        </CardTitle>
        <CardDescription>
          Identifique onde o fato ocorreu e a natureza da ocorrência.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="escola_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                INSTITUIÇÃO DE ENSINO <span className="text-red-500">*</span>
              </FormLabel>
              <Popover open={openSchool} onOpenChange={setOpenSchool}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSchool}
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground',
                      )}
                      disabled={!!selectedSchool}
                    >
                      {field.value
                        ? schools.find((s) => s.id === field.value)?.name ||
                          selectedSchool?.name
                        : 'Selecione a escola relacionada...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar escola..." />
                    <CommandList>
                      <CommandEmpty>Escola não encontrada.</CommandEmpty>
                      {loadingSchools && (
                        <div className="p-4 text-sm text-center text-muted-foreground">
                          Carregando...
                        </div>
                      )}
                      <CommandGroup>
                        {schools.map((school) => (
                          <CommandItem
                            key={school.id}
                            value={school.name}
                            onSelect={() => {
                              setValue('escola_id', school.id)
                              setOpenSchool(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                school.id === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {school.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSchoolId && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700">
                Documentos de Integridade
              </h4>
            </div>

            {loadingDocs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.code ? (
                  <a
                    href={documents.code.arquivo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <div className="bg-white border hover:border-blue-400 hover:shadow-sm transition-all rounded-md p-3 flex items-center gap-3 cursor-pointer h-full">
                      <div className="bg-blue-50 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          Código de Conduta
                        </p>
                        <p className="text-xs text-slate-500">Ler documento</p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </div>
                  </a>
                ) : (
                  <div className="bg-slate-100/50 border border-slate-100 rounded-md p-3 flex items-center gap-3 h-full opacity-60">
                    <div className="bg-slate-200 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-500">
                        Código de Conduta
                      </p>
                      <p className="text-xs text-slate-400">Não disponível</p>
                    </div>
                  </div>
                )}

                {documents.commitment ? (
                  <a
                    href={documents.commitment.arquivo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <div className="bg-white border hover:border-blue-400 hover:shadow-sm transition-all rounded-md p-3 flex items-center gap-3 cursor-pointer h-full">
                      <div className="bg-blue-50 p-2 rounded-full">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          Compromisso de Gestão
                        </p>
                        <p className="text-xs text-slate-500">Ler documento</p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </div>
                  </a>
                ) : (
                  <div className="bg-slate-100/50 border border-slate-100 rounded-md p-3 flex items-center gap-3 h-full opacity-60">
                    <div className="bg-slate-200 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-500">
                        Compromisso de Gestão
                      </p>
                      <p className="text-xs text-slate-400">Não disponível</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <FormField
          control={control}
          name="categories"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                TIPO DE OCORRÊNCIA <span className="text-red-500">*</span>
              </FormLabel>
              <Popover open={openCategory} onOpenChange={setOpenCategory}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full justify-between h-auto min-h-[40px]',
                        !field.value?.length && 'text-muted-foreground',
                      )}
                    >
                      {field.value?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {field.value.map((cat: string) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="mr-1 mb-1"
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        'Selecione as categorias aplicáveis...'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar categoria..." />
                    <CommandList>
                      <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                      <div className="max-h-[300px] overflow-y-auto">
                        {CATEGORY_GROUPS.map((group) => (
                          <CommandGroup
                            key={group.heading}
                            heading={group.heading}
                          >
                            {group.items.map((category) => (
                              <CommandItem
                                key={category}
                                value={category}
                                onSelect={() => {
                                  const current = field.value || []
                                  const updated = current.includes(category)
                                    ? current.filter(
                                        (c: string) => c !== category,
                                      )
                                    : [...current, category]
                                  setValue('categories', updated, {
                                    shouldValidate: true,
                                  })
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value?.includes(category)
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                {category}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </div>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Selecione uma ou mais categorias que se enquadram no ocorrido.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
