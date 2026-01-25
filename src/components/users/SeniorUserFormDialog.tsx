import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  seniorUserService,
  SchoolOption,
  SeniorUser,
} from '@/services/seniorUserService'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  perfil: z.string().min(1, 'Selecione um perfil'),
  escola_id: z.string().min(1, 'Selecione uma escola'),
  password: z.string().optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  ativo: z.boolean().default(true),
})

interface SeniorUserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  loading?: boolean
  initialData?: SeniorUser | null
}

export function SeniorUserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
  initialData,
}: SeniorUserFormDialogProps) {
  const [schools, setSchools] = useState<SchoolOption[]>([])
  const [schoolsLoading, setSchoolsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      perfil: 'colaborador',
      escola_id: '',
      password: '',
      cargo: '',
      departamento: '',
      ativo: true,
    },
  })

  useEffect(() => {
    if (open) {
      const fetchSchools = async () => {
        setSchoolsLoading(true)
        try {
          const data = await seniorUserService.getAllSchools()
          setSchools(data)
        } catch (error) {
          console.error('Error fetching schools', error)
        } finally {
          setSchoolsLoading(false)
        }
      }
      fetchSchools()

      if (initialData) {
        form.reset({
          nome: initialData.nome_usuario,
          email: initialData.email,
          perfil: initialData.perfil,
          escola_id: initialData.escola_id || '',
          password: '',
          cargo: initialData.cargo || '',
          departamento: initialData.departamento || '',
          ativo: initialData.ativo,
        })
      } else {
        form.reset({
          nome: '',
          email: '',
          perfil: 'colaborador',
          escola_id: '',
          password: '',
          cargo: '',
          departamento: '',
          ativo: true,
        })
      }
    }
  }, [open, initialData, form])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!initialData && !values.password) {
      form.setError('password', {
        message: 'Senha é obrigatória para novos usuários',
      })
      return
    }
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Atualize as informações do usuário.'
              : 'Crie um novo usuário e associe a uma escola.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Financeiro, TI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo / Função</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Analista, Gerente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="escola_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escola</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger disabled={schoolsLoading}>
                          <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schools.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nome_escola}
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
                name="perfil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil de Acesso</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                        <SelectItem value="gestor">Gestor de Riscos</SelectItem>
                        <SelectItem value="alta_gestao">Alta Gestão</SelectItem>
                        <SelectItem value="gestao_escola">
                          Gestão Escolar
                        </SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="operacional">Operacional</SelectItem>
                        <SelectItem value="DIRETOR_COMPLIANCE">
                          Diretor Compliance
                        </SelectItem>
                        <SelectItem value="ANALISTA_COMPLIANCE">
                          Analista Compliance
                        </SelectItem>
                        <SelectItem value="SECRETARIA DE EDUCAÇÃO">
                          Secretaria de Educação
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {initialData ? 'Nova Senha (Opcional)' : 'Senha'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        initialData
                          ? 'Deixe em branco para manter'
                          : 'Senha segura'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {initialData
                      ? 'Preencha apenas se desejar alterar a senha do usuário.'
                      : 'Mínimo de 6 caracteres.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status da Conta</FormLabel>
                    <FormDescription>
                      Contas inativas não podem acessar o sistema.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {initialData ? 'Salvar Alterações' : 'Criar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
