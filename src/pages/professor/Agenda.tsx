import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { ptBR } from 'date-fns/locale'

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda Escolar</h1>
        <p className="text-muted-foreground">
          Acompanhe o calendário letivo e eventos importantes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="rounded-md border shadow"
            />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Eventos do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-10">
              <p>Nenhum evento programado para esta data.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
