import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'

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
      <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Visualizador de Anexo</DialogTitle>
          <DialogDescription>
            Pré-visualização do anexo selecionado
          </DialogDescription>
        </DialogHeader>
        <div className="relative flex items-center justify-center w-full h-[80vh]">
          {type === 'video' ? (
            <video
              src={url}
              controls
              className="max-w-full max-h-full rounded-md shadow-2xl bg-black"
            />
          ) : type === 'audio' ? (
            <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-md">
              <audio src={url} controls className="w-full" />
            </div>
          ) : (
            <img
              src={url}
              alt="Anexo"
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl bg-black/50"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
