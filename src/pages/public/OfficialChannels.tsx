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
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  ArrowLeft,
  Building2,
  Globe,
  PanelLeft,
  Siren,
  Phone,
} from 'lucide-react'
import {
  settingsService,
  OfficialChannelsData,
  OfficialChannel,
  EmergencyContact,
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
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg leading-tight text-slate-900">
            {channel.name}
          </CardTitle>
          <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
        </div>
        {channel.label && (
          <Badge variant="secondary" className="w-fit mt-2 font-normal text-xs">
            {channel.label}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <CardDescription className="text-sm text-slate-600">
          {channel.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          className="w-full gap-2 text-primary hover:text-primary hover:bg-primary/5"
          onClick={() =>
            window.open(channel.url, '_blank', 'noopener,noreferrer')
          }
        >
          Acessar Canal
        </Button>
      </CardFooter>
    </Card>
  )

  const EmergencyCard = ({ contact }: { contact: EmergencyContact }) => (
    <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-all">
      <div className="bg-red-100 p-3 rounded-full shrink-0">
        <Phone className="h-6 w-6 text-red-600" />
      </div>
      <div>
        <p className="text-2xl font-black text-red-700 leading-none">
          {contact.number}
        </p>
        <p className="font-bold text-red-900">{contact.name}</p>
        {contact.description && (
          <p className="text-xs text-red-600/80 mt-1">{contact.description}</p>
        )}
      </div>
    </div>
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
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-10 space-y-10">
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
          <div className="space-y-10">
            {/* Emergency Section */}
            {data.emergency && data.emergency.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Siren className="h-6 w-6 text-red-600 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Em caso de urgência
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.emergency.map((contact, idx) => (
                    <EmergencyCard key={idx} contact={contact} />
                  ))}
                </div>
              </section>
            )}

            {/* Channels Tabs */}
            <Tabs defaultValue="br" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 h-auto">
                <TabsTrigger
                  value="br"
                  className="text-base py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  <Globe className="h-4 w-4 mr-2" /> Brasil (Federal)
                </TabsTrigger>
                <TabsTrigger
                  value="mt"
                  className="text-base py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  <Building2 className="h-4 w-4 mr-2" /> Mato Grosso
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="mt"
                className="animate-fade-in-up focus-visible:outline-none"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {data.mato_grosso?.map((channel, idx) => (
                    <ChannelCard key={idx} channel={channel} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent
                value="br"
                className="animate-fade-in-up focus-visible:outline-none"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {data.brasil?.map((channel, idx) => (
                    <ChannelCard key={idx} channel={channel} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-200 mt-auto bg-white">
        <p>
          © {new Date().getFullYear()} ALERTIA. Integridade em primeiro lugar.
        </p>
        <p className="mt-2 text-xs">
          O ALERTIA não possui vínculo direto com os canais externos listados
          acima.
        </p>
      </footer>
    </div>
  )
}
