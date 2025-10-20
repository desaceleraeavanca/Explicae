import { Card } from "@/components/ui/card"
import { Brain, Users, Sparkles, BookMarked } from "lucide-react"

const steps = [
  {
    icon: Brain,
    title: "Identifique o Conceito",
    description: "Digite o conceito complexo que você precisa explicar de forma clara e acessível.",
  },
  {
    icon: Users,
    title: "Defina seu Público",
    description: "Descreva quem precisa entender ou selecione um perfil de público salvo.",
  },
  {
    icon: Sparkles,
    title: "Gere Analogias",
    description: "Nossa IA cria múltiplas analogias criativas personalizadas para seu contexto.",
  },
  {
    icon: BookMarked,
    title: "Salve e Reutilize",
    description: "Construa seu banco pessoal de analogias para uso futuro em apresentações e conteúdos.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">Como Funciona</h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Quatro passos simples para transformar complexidade em clareza
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="p-6 space-y-4 relative overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="absolute top-4 right-4 text-6xl font-bold text-primary/20">{index + 1}</div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
