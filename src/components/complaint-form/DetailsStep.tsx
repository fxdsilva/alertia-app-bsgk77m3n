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
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  UploadCloud,
  X,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
} from 'lucide-react'
import { ACCEPTED_FILE_TYPES_STRING } from './constants'

interface DetailsStepProps {
  files: File[]
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
}

export function DetailsStep({
  files,
  onFileChange,
  onRemoveFile,
}: DetailsStepProps) {
  const { control } = useFormContext()

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
      return <FileImage className="h-4 w-4 text-blue-500" />
    if (type.startsWith('video/') || /\.(mp4|mov|avi|webm)$/i.test(name))
      return <FileVideo className="h-4 w-4 text-purple-500" />
    if (type.startsWith('audio/') || /\.(mp3|wav|m4a|aac)$/i.test(name))
      return <FileAudio className="h-4 w-4 text-orange-500" />
    if (type.includes('pdf') || /\.pdf$/i.test(name))
      return <FileText className="h-4 w-4 text-red-500" />
    return <FileText className="h-4 w-4 text-slate-500" />
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-teal-700 flex items-center gap-2">
          <span className="border border-teal-200 bg-teal-50 w-6 h-6 rounded flex items-center justify-center text-xs">
            4
          </span>
          Relato Detalhado
        </CardTitle>
        <CardDescription>
          Descreva o que aconteceu e anexe provas se tiver.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                DESCRIÇÃO DA OCORRÊNCIA <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o que aconteceu, quando, onde e quem estava envolvido. Quanto mais detalhes, melhor será a apuração."
                  className="min-h-[150px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Relate os fatos de forma clara e objetiva. Mínimo de 20
                caracteres.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Anexar Evidências (Opcional)</FormLabel>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
            <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">
              Clique para adicionar documentos, fotos, vídeos ou áudios
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Suporta Imagens, PDF, Áudio (MP3, WAV, M4A) e Vídeo (MP4, MOV,
              AVI) até 50MB
            </p>
            <Input
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES_STRING}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={onFileChange}
              value=""
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white border p-2 rounded-md shadow-sm"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="bg-slate-100 p-2 rounded">
                      {getFileIcon(file.type, file.name)}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm truncate max-w-[200px] sm:max-w-xs font-medium">
                        {file.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                        {file.type.split('/')[1] ||
                          file.name.split('.').pop() ||
                          'arquivo'}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={() => onRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
