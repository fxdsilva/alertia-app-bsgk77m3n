import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Check if user has dismissed the prompt recently (in the last 24h)
      const dismissed = localStorage.getItem('pwa-prompt-dismissed')
      if (!dismissed || Date.now() - parseInt(dismissed) > 86400000) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[24rem] z-50 bg-card text-card-foreground p-4 rounded-xl shadow-xl border border-border flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="flex-1">
        <h3 className="font-semibold text-base mb-1">Instalar App Alertia</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Adicione nossa plataforma à sua tela inicial para acesso mais rápido,
          experiência aprimorada e uso offline.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="w-full font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Instalar App
          </Button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
        aria-label="Dispensar aviso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
