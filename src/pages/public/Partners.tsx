import {
  Building2,
  FileText,
  Award,
  Landmark,
  Handshake,
  Download,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const partners = [
  {
    name: 'Instituto Educar',
    type: 'Instituição de Ensino',
    logo: 'https://img.usecurling.com/i?q=education&shape=outline&color=blue',
  },
  {
    name: 'Fundação Futuro',
    type: 'ONG',
    logo: 'https://img.usecurling.com/i?q=foundation&shape=outline&color=green',
  },
  {
    name: 'Tech Escola',
    type: 'EdTech',
    logo: 'https://img.usecurling.com/i?q=tech&shape=outline&color=cyan',
  },
  {
    name: 'Rede Aprender',
    type: 'Rede de Escolas',
    logo: 'https://img.usecurling.com/i?q=school&shape=outline&color=orange',
  },
  {
    name: 'Saber Mais',
    type: 'Instituição de Ensino',
    logo: 'https://img.usecurling.com/i?q=book&shape=outline&color=purple',
  },
  {
    name: 'Educa Brasil',
    type: 'ONG',
    logo: 'https://img.usecurling.com/i?q=globe&shape=outline&color=azure',
  },
]

const sponsors = [
  {
    name: 'TechCorp',
    logo: 'https://img.usecurling.com/i?q=corporate&shape=fill&color=black',
  },
  {
    name: 'Banco Inova',
    logo: 'https://img.usecurling.com/i?q=bank&shape=fill&color=blue',
  },
  {
    name: 'Fundação Global',
    logo: 'https://img.usecurling.com/i?q=globe&shape=fill&color=green',
  },
]

const governmentSupport = [
  {
    name: 'Ministério da Educação',
    logo: 'https://img.usecurling.com/i?q=government&shape=lineal-color&color=multicolor',
  },
  {
    name: 'Universidade Federal',
    logo: 'https://img.usecurling.com/i?q=university&shape=lineal-color&color=multicolor',
  },
  {
    name: 'Secretaria Estadual',
    logo: 'https://img.usecurling.com/i?q=building&shape=lineal-color&color=multicolor',
  },
]

const documents = [
  {
    title: 'Certificado de Conformidade 2023',
    type: 'Certificado',
    date: 'Dez 2023',
    icon: Award,
  },
  {
    title: 'Termo de Cooperação Técnica - MEC',
    type: 'Termo',
    date: 'Jan 2024',
    icon: Handshake,
  },
  {
    title: 'Certificação ISO 37001',
    type: 'Certificado',
    date: 'Fev 2024',
    icon: Award,
  },
  {
    title: 'Convênio Universidade Federal',
    type: 'Termo',
    date: 'Mar 2024',
    icon: FileText,
  },
]

export default function Partners() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge className="mb-4" variant="secondary">
            Rede de Confiança
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Instituições Parceiras
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Acreditamos que a integridade e a transparência se fortalecem com o
            apoio mútuo. Nossa rede de parceiros institucionais reflete nosso
            compromisso com a excelência e as melhores práticas no ambiente
            educacional.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-20 py-16">
        {/* Patrocinadores e Apoio Institucional */}
        <div className="grid md:grid-cols-2 gap-12">
          <section>
            <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              Apoio Institucional e Governamental
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {governmentSupport.map((gov, i) => (
                <Card
                  key={i}
                  className="border-none shadow-none bg-secondary/30 flex flex-col items-center justify-center p-6 hover:bg-secondary/50 transition-colors"
                >
                  <img
                    src={gov.logo}
                    alt={gov.name}
                    className="w-16 h-16 mb-4 opacity-80"
                  />
                  <span className="text-sm font-medium text-center text-muted-foreground">
                    {gov.name}
                  </span>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Patrocinadores
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {sponsors.map((sponsor, i) => (
                <Card
                  key={i}
                  className="border-none shadow-none bg-secondary/30 flex flex-col items-center justify-center p-6 hover:bg-secondary/50 transition-colors"
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-16 h-16 mb-4 opacity-80"
                  />
                  <span className="text-sm font-medium text-center text-muted-foreground">
                    {sponsor.name}
                  </span>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Instituições Parceiras */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold flex items-center justify-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Rede de Escolas e Instituições
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Organizações que compartilham nossos valores e participam
              ativamente da nossa rede de integridade educacional.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partners.map((partner, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300"
                  />
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    {partner.type}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Documentos Públicos */}
        <section className="bg-secondary/20 -mx-4 px-4 py-16 md:-mx-8 md:px-8 rounded-3xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                Certificados e Termos de Cooperação
              </h2>
              <p className="text-muted-foreground mt-4">
                Transparência é um de nossos pilares. Acesse os documentos
                oficiais que firmam nossas parcerias.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {documents.map((doc, i) => {
                const Icon = doc.icon
                return (
                  <Card
                    key={i}
                    className="flex flex-row items-center p-4 hover:border-primary/50 transition-colors cursor-pointer group"
                  >
                    <div className="bg-primary/10 p-3 rounded-full mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm md:text-base leading-tight">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase"
                        >
                          {doc.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {doc.date}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground group-hover:text-primary"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
