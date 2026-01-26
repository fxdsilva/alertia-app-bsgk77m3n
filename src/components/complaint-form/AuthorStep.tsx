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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLES } from './constants'

export function AuthorStep() {
  const { control } = useFormContext()

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
          <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
            3
          </span>
          Quem praticou a ação?
        </CardTitle>
        <CardDescription>
          Selecione a função ou vínculo da pessoa que praticou a ação ou
          omissão.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="autor_funcao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                FUNÇÃO / VÍNCULO DO AUTOR{' '}
                <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vínculo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="autor_nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NOME DA PESSOA (SE SOUBER)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João Silva" {...field} />
                </FormControl>
                <FormDescription>Preencha apenas se souber.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="autor_descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DESCRIÇÃO (SE NÃO SOUBER O NOME)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: professor de matemática do 8º ano, turno da manhã..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
