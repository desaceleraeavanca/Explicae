import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Descoberta",
    price: "Grátis",
    period: "7 dias",
    description: "Experimente a ferramenta sem compromisso",
    features: ["30 faíscas (90 analogias)", "Acesso a todos os recursos", "Banco de analogias", "Dialetos de público"],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Clareza",
    price: "R$ 24,90",
    period: "/mês",
    description: "Para profissionais que usam regularmente",
    features: [
      "Analogias ilimitadas",
      "Banco de analogias ilimitado",
      "Dialetos de público ilimitados",
      "Analisador de clareza",
      "Faísca criativa diária",
      "Sistema de conquistas",
    ],
    cta: "Assinar Agora",
    highlighted: true,
  },
  {
    name: "Maestria",
    price: "R$ 249",
    period: "/ano",
    description: "Melhor valor para usuários engajados",
    features: ["Tudo do plano Clareza", "Economia de 17%", "Suporte prioritário", "Acesso antecipado a novos recursos"],
    cta: "Assinar Anual",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="planos" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">Planos Simples e Transparentes</h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades de comunicação
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 space-y-6 relative ${plan.highlighted ? "border-primary shadow-lg scale-105" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Mais Popular
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <Button
                className={`w-full ${plan.highlighted ? "bg-primary hover:bg-primary/90" : ""}`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3 pt-4 border-t">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="inline-block p-6 bg-accent/10 border-accent/20">
            <p className="text-sm font-medium">
              <span className="text-accent">Pacote de Faíscas:</span> R$ 34,90 por 300 analogias (válido por 12 meses)
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
