import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockComplaints } from '@/lib/mockData'
import { Badge } from '@/components/ui/badge'

export default function InternalInvestigations() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Investigações Internas</h1>
      <div className="grid gap-4">
        {mockComplaints.map((c) => (
          <Card key={c.protocol} className="hover:bg-muted/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{c.type}</CardTitle>
              <Badge
                variant={c.status === 'Concluída' ? 'secondary' : 'default'}
              >
                {c.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Protocolo: {c.protocol}
              </p>
              <p className="text-sm text-muted-foreground">Data: {c.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
