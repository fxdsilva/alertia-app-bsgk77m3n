import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'

interface AttachmentViewerProps {
  url: string
  onClose: () => void
}

export function AttachmentViewer({ url, onClose }: AttachmentViewerProps) {
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
          <img
            src={url}
            alt="Anexo"
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl bg-black/50"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
