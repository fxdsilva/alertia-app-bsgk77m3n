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
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'

export function IdentificationStep() {
  const { control } = useFormContext()

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
          Escolha se deseja se identificar ou manter o anonimato.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="anonimo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-white">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-bold">
                  DENÚNCIA ANÔNIMA
                </FormLabel>
                <FormDescription>
                  Seus dados não serão identificados na apuração.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-green-600"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
