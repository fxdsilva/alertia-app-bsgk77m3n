import { useState } from 'react'
import {
  Paperclip,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  FileArchive,
  FileVideo,
  FileAudio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AttachmentViewer } from './AttachmentViewer'
import type { Attachment } from '@/services/complaintService'

interface AttachmentListProps {
  attachments?: Attachment[]
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)

  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-md border border-dashed">
        <Paperclip className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-muted-foreground">
          Nenhum anexo disponível
        </p>
      </div>
    )
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />
      case 'pdf':
        return <FileText className="h-5 w-5" />
      case 'archive':
        return <FileArchive className="h-5 w-5" />
      case 'video':
        return <FileVideo className="h-5 w-5" />
      case 'audio':
        return <FileAudio className="h-5 w-5" />
      default:
        return <Paperclip className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 bg-card border rounded-md shadow-sm transition-colors hover:bg-accent/50 group"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 bg-muted rounded-md text-muted-foreground group-hover:text-foreground transition-colors">
                {getFileIcon(file.type)}
              </div>
              <div className="truncate">
                <p
                  className="text-sm font-medium truncate"
                  title={file.fileName}
                >
                  {file.fileName}
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  {file.type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {file.type === 'image' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedUrl(file.url)}
                  title="Visualizar"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Button>
              ) : file.type === 'pdf' ? (
                <Button variant="ghost" size="icon" asChild title="Abrir PDF">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" asChild title="Baixar">
                  <a
                    href={file.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedUrl && (
        <AttachmentViewer
          url={selectedUrl}
          onClose={() => setSelectedUrl(null)}
        />
      )}
    </div>
  )
}
