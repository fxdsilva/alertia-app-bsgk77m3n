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

export function VictimStep() {
  const { control } = useFormContext()

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
          <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
            2
          </span>
          Quem sofreu o ocorrido?
        </CardTitle>
        <CardDescription>
          Informe quem foi afetado pela situação relatada. Pode ser você ou
          outra pessoa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="vitima_funcao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                QUAL A FUNÇÃO DA VÍTIMA? <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função..." />
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
            name="vitima_nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NOME DA VÍTIMA (SE SOUBER)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Maria Souza" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="vitima_setor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SETOR/TURMA/SALA DA VÍTIMA</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 9º ano B, Secretaria, etc."
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
