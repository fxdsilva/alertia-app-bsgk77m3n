import { ReactNode } from 'react'
import { GraduationCap } from 'lucide-react'

interface TrainingLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export function TrainingLayout({
  children,
  title,
  description,
}: TrainingLayoutProps) {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
