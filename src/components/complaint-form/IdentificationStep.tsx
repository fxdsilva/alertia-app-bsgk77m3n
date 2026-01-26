import { useEffect } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Shield, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLES } from './constants'

export function IdentificationStep() {
  const { control, watch, setValue, clearErrors } = useFormContext()
  const anonimo = watch('anonimo')

  // Clear fields when switching back to anonymous
  useEffect(() => {
    if (anonimo) {
      setValue('denunciante_nome', '')
      setValue('denunciante_email', '')
      setValue('denunciante_telefone', '')
      setValue('denunciante_vinculo', '')
      clearErrors([
        'denunciante_nome',
        'denunciante_email',
        'denunciante_vinculo',
      ])
    }
  }, [anonimo, setValue, clearErrors])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    // Mask format: (99) 99999-9999
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    }
    if (value.length > 9) {
      value = `${value.slice(0, 9)}-${value.slice(9)}`
    }
    setValue('denunciante_telefone', value)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
          <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
            5
          </span>
          Identificação
        </CardTitle>
        <CardDescription>
          Você pode optar por manter o anonimato ou se identificar para receber
          retorno.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="anonimo"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>COMO DESEJA PROSSEGUIR?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(val) => field.onChange(val === 'true')}
                  defaultValue={field.value ? 'true' : 'false'}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="true" className="peer sr-only" />
                    </FormControl>
                    <FormLabel
                      className={cn(
                        'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer',
                      )}
                    >
                      <Shield className="mb-3 h-6 w-6 text-slate-500 peer-data-[state=checked]:text-primary" />
                      <div className="text-center">
                        <span className="font-semibold block mb-1">
                          Manter Anonimato
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Seus dados não serão solicitados nem armazenados.
                        </span>
                      </div>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="false" className="peer sr-only" />
                    </FormControl>
                    <FormLabel
                      className={cn(
                        'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer',
                      )}
                    >
                      <User className="mb-3 h-6 w-6 text-slate-500 peer-data-[state=checked]:text-primary" />
                      <div className="text-center">
                        <span className="font-semibold block mb-1">
                          Quero me Identificar
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Permite que a equipe entre em contato para feedback.
                        </span>
                      </div>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!anonimo && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4 animate-fade-in-down">
            <div className="flex items-center gap-2 mb-2 text-primary font-medium border-b border-slate-200 pb-2">
              <ShieldAlert className="h-4 w-4" />
              Dados do Denunciante
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="denunciante_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nome Completo <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="denunciante_vinculo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Vínculo com a Instituição{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="denunciante_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      E-mail para Contato{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Usado apenas para feedback sobre sua denúncia.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="denunciante_telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone / WhatsApp (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(99) 99999-9999"
                        {...field}
                        onChange={(e) => {
                          handlePhoneChange(e)
                          field.onChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
