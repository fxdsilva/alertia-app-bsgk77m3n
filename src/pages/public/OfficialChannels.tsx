import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ExternalLink,
  ArrowLeft,
  Building2,
  Globe,
  PanelLeft,
} from 'lucide-react'
import {
  settingsService,
  OfficialChannelsData,
  OfficialChannel,
} from '@/services/settingsService'
import { Loader2 } from 'lucide-react'

export default function OfficialChannels() {
  const navigate = useNavigate()
  const [data, setData] = useState<OfficialChannelsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const channels = await settingsService.getOfficialChannels()
        setData(channels)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchChannels()
  }, [])

  const ChannelCard = ({ channel }: { channel: OfficialChannel }) => (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg leading-tight">{channel.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription className="text-sm text-foreground/80">
          {channel.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          className="w-full gap-2 text-primary hover:text-primary"
          onClick={() =>
            window.open(channel.url, '_blank', 'noopener,noreferrer')
          }
        >
          Acessar Portal <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 lg:px-8 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="bg-emerald-700/10 p-1.5 rounded-md">
            <PanelLeft className="h-5 w-5 text-emerald-800" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            ALERTIA
          </span>
        </div>
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Canais Oficiais Externos
          </h1>
          <p className="text-lg text-slate-500">
            Acesse diretamente os portais de ouvidoria e denúncia dos órgãos
            oficiais do Mato Grosso e do Brasil.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>Informações não disponíveis no momento.</p>
          </div>
        ) : (
          <Tabs defaultValue="mt" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="mt" className="text-base py-3">
                <Building2 className="h-4 w-4 mr-2" /> Mato Grosso
              </TabsTrigger>
              <TabsTrigger value="br" className="text-base py-3">
                <Globe className="h-4 w-4 mr-2" /> Brasil (Federal)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mt" className="animate-fade-in-up">
              <div className="grid md:grid-cols-2 gap-6">
                {data.mato_grosso?.map((channel, idx) => (
                  <ChannelCard key={idx} channel={channel} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="br" className="animate-fade-in-up">
              <div className="grid md:grid-cols-2 gap-6">
                {data.brasil?.map((channel, idx) => (
                  <ChannelCard key={idx} channel={channel} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-200 mt-auto bg-white">
        © {new Date().getFullYear()} ALERTIA. Integridade em primeiro lugar.
      </footer>
    </div>
  )
}
