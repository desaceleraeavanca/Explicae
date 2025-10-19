import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Target, MessageSquare, Zap } from "lucide-react"

const tips = [
  {
    icon: Target,
    title: "Seja Específico",
    description: "Quanto mais detalhes sobre o conceito, melhor a analogia gerada.",
  },
  {
    icon: MessageSquare,
    title: "Conheça sua Audiência",
    description: "Escolha o nível de conhecimento correto para sua audiência.",
  },
  {
    icon: Zap,
    title: "Use Contexto",
    description: "Adicione exemplos ou situações específicas para analogias mais relevantes.",
  },
  {
    icon: Lightbulb,
    title: "Experimente Tons",
    description: "Diferentes tons funcionam melhor para diferentes situações.",
  },
]

export function GenerationTips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dicas para Melhores Analogias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip) => {
          const Icon = tip.icon
          return (
            <div key={tip.title} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{tip.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
              </div>
            </div>
          )
        })}

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-2">Exemplo de Bom Input</h4>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-foreground mb-2">
              <span className="font-medium">Conceito:</span> API REST
            </p>
            <p className="text-xs text-foreground mb-2">
              <span className="font-medium">Contexto:</span> Explicar para equipe de vendas como nosso produto se
              integra com outros sistemas
            </p>
            <p className="text-xs text-foreground">
              <span className="font-medium">Audiência:</span> Não-técnicos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
