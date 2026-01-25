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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { seniorUserService, SchoolOption } from '@/services/seniorUserService'
import { Loader2 } from 'lucide-react'

const userSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  perfil: z.string().min(1, 'Selecione um perfil'),
  escola_id: z.string().min(1, 'Selecione uma escola'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

interface SeniorUserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: z.infer<typeof userSchema>) => Promise<void>
  loading?: boolean
}

export function SeniorUserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: SeniorUserFormDialogProps) {
  const [schools, setSchools] = useState<SchoolOption[]>([])
  const [schoolsLoading, setSchoolsLoading] = useState(false)

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      perfil: 'colaborador',
      escola_id: '',
      password: '',
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
      form.reset({
        nome: '',
        email: '',
        perfil: 'colaborador',
        escola_id: '',
        password: '',
      })
    }
  }, [open, form])

  const handleSubmit = async (values: z.infer<typeof userSchema>) => {
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário e associe a uma escola.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Senha segura"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="escola_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escola</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
                  <FormLabel>Perfil</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
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
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
