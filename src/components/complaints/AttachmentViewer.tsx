import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface AttachmentViewerProps {
  url: string
  onClose: () => void
}

export function AttachmentViewer({ url, onClose }: AttachmentViewerProps) {
  const getFileName = (url: string) => {
    try {
      const decoded = decodeURIComponent(url)
      const parts = decoded.split('/')
      const filename = parts[parts.length - 1]
      return filename.split('?')[0] || 'Visualização de Anexo'
    } catch {
      return 'Visualização de Anexo'
    }
  }

  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="truncate">{getFileName(url)}</DialogTitle>
          <DialogDescription className="sr-only">
            Visualização de anexo
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 bg-muted/30 relative flex items-center justify-center overflow-hidden p-4">
          <img
            src={url}
            alt="Anexo"
            className="max-w-full max-h-full object-contain rounded-md shadow-sm"
          />
        </div>
        <div className="p-4 border-t flex justify-end">
          <Button asChild>
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Baixar Original
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
