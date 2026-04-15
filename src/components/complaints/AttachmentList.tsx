import { useState } from 'react'
import {
  Paperclip,
  FileText,
  Image as ImageIcon,
  Download,
  FileArchive,
  FileVideo,
  FileAudio,
  Eye,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AttachmentViewer } from './AttachmentViewer'
import type { Attachment } from '@/services/complaintService'

interface AttachmentListProps {
  attachments?: Attachment[]
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  const [selectedFile, setSelectedFile] = useState<{
    url: string
    type: string
  } | null>(null)

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
      case 'spreadsheet':
        return <FileSpreadsheet className="h-5 w-5" />
      case 'document':
        return <FileText className="h-5 w-5" />
      default:
        return <Paperclip className="h-5 w-5" />
    }
  }

  const handleAction = (file: Attachment, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }

    if (['image', 'video', 'audio', 'pdf'].includes(file.type)) {
      setSelectedFile({ url: file.url, type: file.type })
    } else {
      window.open(file.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {attachments.map((file) => (
          <div
            key={file.id}
            onClick={() => handleAction(file)}
            className="flex items-center justify-between p-3 bg-card border rounded-md shadow-sm transition-colors hover:bg-accent/50 hover:border-primary/50 cursor-pointer group"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 bg-muted rounded-md text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                {getFileIcon(file.type)}
              </div>
              <div className="truncate">
                <p
                  className="text-sm font-medium truncate group-hover:text-primary transition-colors"
                  title={file.fileName}
                >
                  {file.fileName}
                </p>
                <p className="text-xs text-muted-foreground uppercase mt-0.5">
                  {file.type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity pl-2">
              {['image', 'video', 'audio', 'pdf'].includes(file.type) ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => handleAction(file, e)}
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  asChild
                  title="Baixar"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={file.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedFile && (
        <AttachmentViewer
          url={selectedFile.url}
          type={selectedFile.type}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}
