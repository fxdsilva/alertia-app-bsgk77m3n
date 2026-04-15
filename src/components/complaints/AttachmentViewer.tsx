import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'
import { FileText, Download, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AttachmentViewerProps {
  url: string
  type?: string
  onClose: () => void
}

export function AttachmentViewer({
  url,
  type = 'image',
  onClose,
}: AttachmentViewerProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Visualizador de Anexo</DialogTitle>
          <DialogDescription>
            Pré-visualização do anexo selecionado
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex items-center justify-center w-full h-[85vh] rounded-lg overflow-hidden">
          {type === 'video' ? (
            <video
              src={url}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-md shadow-2xl bg-black"
            />
          ) : type === 'audio' ? (
            <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Music className="h-10 w-10" />
              </div>
              <audio src={url} controls className="w-full" autoPlay />
            </div>
          ) : type === 'pdf' ? (
            <iframe
              src={`${url}#toolbar=0`}
              className="w-full h-full rounded-md shadow-2xl bg-white border-0"
              title="Visualizador de PDF"
            />
          ) : type === 'image' ? (
            <img
              src={url}
              alt="Anexo"
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl bg-black/50"
            />
          ) : (
            <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md flex flex-col items-center text-center gap-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">
                  Arquivo não suportado para visualização
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Faça o download para abrir no seu dispositivo.
                </p>
              </div>
              <Button asChild className="mt-4">
                <a
                  href={url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Arquivo
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
