import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ShieldCheck, UserCog, Lock, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { complianceService } from '@/services/complianceService'
import { adminService } from '@/services/adminService'
import { SchoolUser } from '@/services/schoolAdminService'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const taskSchema = z.object({
  analista_id: z.string().min(1, 'Selecione um analista'),
  escola_id: z.string().min(1, 'Selecione uma escola'),
  tipo_modulo: z.string().min(1, 'Selecione o tipo de tarefa'),
  descricao: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  prazo: z.string().min(1, 'Defina um prazo'),
  institutional_docs_auth: z.boolean().default(false),
  gestor_escolar_id: z.string().optional(),
  access_view_content: z.boolean().default(false),
  access_view_evidence: z.boolean().default(false),
  access_track_status: z.boolean().default(false),
})

interface TaskAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: () => void
}

export function TaskAssignmentDialog({
  open,
  onOpenChange,
  onTaskCreated,
}: TaskAssignmentDialogProps) {
  const [analysts, setAnalysts] = useState<SchoolUser[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [managers, setManagers] = useState<SchoolUser[]>([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [loadingManagers, setLoadingManagers] = useState(false)

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      institutional_docs_auth: false,
      access_view_content: false,
      access_view_evidence: false,
      access_track_status: false,
      gestor_escolar_id: 'none',
    },
  })

  const selectedSchoolId = form.watch('escola_id')
  const selectedModule = form.watch('tipo_modulo')

  useEffect(() => {
    if (open) {
      loadResources()
      form.reset({
        institutional_docs_auth: false,
        access_view_content: false,
        access_view_evidence: false,
        access_track_status: false,
        gestor_escolar_id: 'none',
      })
    }
  }, [open])

  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== 'none') {
      loadManagers(selectedSchoolId)
    } else {
      setManagers([])
    }
  }, [selectedSchoolId])

  // Automatically enable docs auth if "documentacao" module is selected
  useEffect(() => {
    if (selectedModule === 'documentacao') {
      form.setValue('institutional_docs_auth', true)
    }
  }, [selectedModule, form])

  const loadResources = async () => {
    setLoadingResources(true)
    try {
      const [analystsData, schoolsData] = await Promise.all([
        complianceService.getAnalysts(),
        adminService.getAllSchools(),
      ])
      setAnalysts(analystsData)
      setSchools(schoolsData)
    } catch (error) {
      toast.error('Erro ao carregar dados iniciais')
    } finally {
      setLoadingResources(false)
    }
  }

  const loadManagers = async (schoolId: string) => {
    setLoadingManagers(true)
    try {
      const managersData = await complianceService.getSchoolManagers(schoolId)
      setManagers(managersData)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar gestores da escola')
    } finally {
      setLoadingManagers(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    try {
      const payload: any = {
        analista_id: values.analista_id,
        escola_id: values.escola_id,
        tipo_modulo: values.tipo_modulo,
        descricao: values.descricao,
        prazo: values.prazo,
      }

      // Handle Institutional Docs Permission
      if (values.tipo_modulo === 'documentacao') {
        payload.institutional_docs_auth = {
          include: true,
          elaborate: true,
          update: true,
          consolidate: true,
        }
      } else {
        payload.institutional_docs_auth = values.institutional_docs_auth
          ? {
              include: true,
              elaborate: true,
              update: true,
              consolidate: true,
            }
          : {
              include: false,
              elaborate: false,
              update: false,
              consolidate: false,
            }
      }

      // Handle School Manager Access
      if (values.gestor_escolar_id && values.gestor_escolar_id !== 'none') {
        payload.gestor_escolar_id = values.gestor_escolar_id
        payload.school_manager_access_config = {
          view_content: values.access_view_content,
          view_evidence: values.access_view_evidence,
          track_status: values.access_track_status,
        }
      }

      await complianceService.createTask(payload)
      toast.success('Atribuição criada com sucesso!')
      onOpenChange(false)
      onTaskCreated()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao criar atribuição')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Nova Atribuição de Tarefa
          </DialogTitle>
          <DialogDescription>
            Defina o escopo, responsável e permissões específicas para esta
            tarefa de compliance.
          </DialogDescription>
        </DialogHeader>

        {loadingResources ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="escola_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instituição de Ensino</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a escola" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="analista_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analista Responsável</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o analista" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {analysts.map((analyst) => (
                            <SelectItem key={analyst.id} value={analyst.id}>
                              {analyst.nome_usuario}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo_modulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Módulo / Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value="documentacao"
                            className="font-semibold text-purple-700"
                          >
                            ★ Gestão de Documentos (Código e Compromisso)
                          </SelectItem>
                          <SelectItem value="compromisso">
                            Compromisso Alta Gestão
                          </SelectItem>
                          <SelectItem value="codigo_conduta">
                            Código de Conduta
                          </SelectItem>
                          <SelectItem value="treinamentos">
                            Treinamentos
                          </SelectItem>
                          <SelectItem value="auditoria">Auditoria</SelectItem>
                          <SelectItem value="riscos">
                            Gestão de Riscos
                          </SelectItem>
                          <SelectItem value="controles_internos">
                            Controles Internos
                          </SelectItem>
                          <SelectItem value="consolidacao">
                            Consolidação & Relatórios
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prazo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de Conclusão</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedModule === 'documentacao' && (
                <Alert className="bg-purple-50 border-purple-200">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800">
                    Acesso Total a Documentos
                  </AlertTitle>
                  <AlertDescription className="text-purple-700 text-xs">
                    Ao selecionar este módulo, o analista receberá
                    automaticamente permissões de edição e consolidação para o
                    Código de Conduta e Termo de Compromisso desta escola.
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escopo da Tarefa</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente o que deve ser feito..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permission Section: Institutional Documents */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80 border-b pb-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  Autorizações Especiais do Analista
                </h3>
                <FormField
                  control={form.control}
                  name="institutional_docs_auth"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-muted/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Gestão de Documentos Institucionais
                        </FormLabel>
                        <FormDescription>
                          Permite ao analista incluir e consolidar Códigos de
                          Conduta e Relatórios.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={selectedModule === 'documentacao'}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Permission Section: School Management Access */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80 border-b pb-2">
                  <Lock className="h-4 w-4 text-orange-600" />
                  Acesso da Gestão Escolar (Opcional)
                </h3>

                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100 space-y-4">
                  <FormField
                    control={form.control}
                    name="gestor_escolar_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-orange-900">
                          Gestor Autorizado
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={
                            !selectedSchoolId || selectedSchoolId === 'none'
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Selecione um gestor para conceder acesso..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              -- Nenhum acesso concedido --
                            </SelectItem>
                            {managers.length === 0 && (
                              <SelectItem value="loading" disabled>
                                {loadingManagers
                                  ? 'Carregando gestores...'
                                  : 'Nenhum gestor encontrado nesta escola'}
                              </SelectItem>
                            )}
                            {managers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.nome_usuario} (
                                {manager.cargo || 'Gestão'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-orange-800/70 text-xs">
                          Selecionar um gestor permitirá configurar acessos
                          específicos a esta tarefa sensível.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {form.watch('gestor_escolar_id') &&
                    form.watch('gestor_escolar_id') !== 'none' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 animate-fade-in">
                        <FormField
                          control={form.control}
                          name="access_view_content"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-white p-3 rounded-lg border border-orange-200">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  Ver Conteúdo
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="access_view_evidence"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-white p-3 rounded-lg border border-orange-200">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  Ver Evidências
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="access_track_status"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-white p-3 rounded-lg border border-orange-200">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  Acompanhar
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="shadow-md"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    'Confirmar Atribuição'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
