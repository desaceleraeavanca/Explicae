import { Card } from "@/components/ui/card"
import { Database, MessageSquare, Zap, Trophy, FileSearch, Sparkles } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Geração Inteligente",
    description: "IA avançada que cria analogias criativas e contextualizadas para qualquer conceito.",
  },
  {
    icon: Database,
    title: "Banco de Analogias",
    description: "Salve, organize e acesse suas melhores analogias em um banco pessoal.",
  },
  {
    icon: MessageSquare,
    title: "Dialetos de Público",
    description: "Crie perfis de público personalizados para gerar analogias ainda mais precisas.",
  },
  {
    icon: Zap,
    title: "Faísca Criativa Diária",
    description: "Receba uma analogia inspiradora todos os dias para manter sua criatividade afiada.",
  },
  {
    icon: FileSearch,
    title: "Analisador de Clareza",
    description: "Identifique jargões e complexidade em seus textos com sugestões de melhoria.",
  },
  {
    icon: Trophy,
    title: "Sistema de Conquistas",
    description: "Desbloqueie badges e gamifique sua jornada de comunicação clara.",
  },
]

export function FeaturesSection() {
  return (
    <section id="recursos" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">Recursos Poderosos</h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Tudo que você precisa para se tornar um mestre em explicações claras
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
