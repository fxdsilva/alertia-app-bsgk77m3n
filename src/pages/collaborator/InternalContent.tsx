import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InternalContent() {
  const documents = [
    {
      id: 1,
      title: 'Política de Integridade 2024',
      type: 'PDF',
      date: '01/01/2024',
    },
    { id: 2, title: 'Manual do Colaborador', type: 'PDF', date: '15/02/2024' },
    {
      id: 3,
      title: 'Procedimentos de Compras',
      type: 'DOCX',
      date: '10/03/2024',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Conteúdos Internos</h1>
      <div className="flex max-w-sm">
        <Input placeholder="Buscar documentos..." />
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="flex flex-row items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {doc.type} • {doc.date}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Download className="h-5 w-5" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
