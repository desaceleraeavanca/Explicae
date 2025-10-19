import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, BookOpen, Users, Zap } from "lucide-react"

const guidelines = [
  {
    icon: Target,
    title: "Seja Direto",
    description: "Vá direto ao ponto. Evite rodeios e informações desnecessárias.",
  },
  {
    icon: BookOpen,
    title: "Use Exemplos",
    description: "Exemplos concretos ajudam a tornar conceitos abstratos mais compreensíveis.",
  },
  {
    icon: Users,
    title: "Conheça a Audiência",
    description: "Adapte sua linguagem ao nível de conhecimento do seu público.",
  },
  {
    icon: Zap,
    title: "Seja Conciso",
    description: "Frases curtas e diretas são mais fáceis de entender e lembrar.",
  },
]

export function AnalyzerGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Guia de Clareza</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {guidelines.map((guide) => {
            const Icon = guide.icon
            return (
              <div key={guide.title} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{guide.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{guide.description}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Métricas Explicadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Legibilidade</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mede quão fácil é ler e entender o texto baseado em comprimento de frases e palavras.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Simplicidade</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Avalia o uso de linguagem simples e direta, evitando jargões desnecessários.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Engajamento</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Analisa elementos que mantêm o leitor interessado, como exemplos e variação.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Estrutura</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verifica a organização lógica e fluxo do texto, incluindo transições.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
