"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check } from "lucide-react"
import Link from "next/link"

const formatBRL = (value: number) =>
  Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(value);

const plans = [
  {
    name: "Recarga de Faíscas",
    price: 34.9,
    period: "",
    suffixLabel: "Pagamento único",
    subtitle: "Ideal para projetos específicos, sem assinatura.",
    longDescription:
      "Perfeito para projetos específicos, apresentações importantes ou para quem prefere a liberdade de usar o Explicaê exatamente quando a inspiração (ou a necessidade) chama.",
    features: [
        "100 Faíscas (300 analogias)",
        "Validade de 12 Meses",
        "Acesso a todos os recursos",
      ],
    cta: "Comprar Pacote",
    highlighted: false,
  },
  {
    name: "Clareza",
    price: 24.9,
    period: "/mês",
    subtitle: "Crie sem limites. O plano definitivo para uso contínuo.",
    longDescription:
      "O plano ideal para criadores de conteúdo, educadores e comunicadores que buscam um fluxo contínuo de criatividade para elevar seu trabalho, sem se preocupar com limites.",
    features: [
        "Faíscas Ilimitadas*",
        "Exportação de resultados",
        "Suporte Prioritário",
      ],
    cta: "Assinar Agora",
    highlighted: true,
  },
  {
    name: "Maestria",
    price: 249,
    period: "/ano",
    subtitle: "Compromisso total. O melhor custo-benefício.",
    longDescription:
      "A escolha definitiva para quem está comprometido com a excelência. Todos os benefícios do plano Clareza, com um desconto significativo como nosso agradecimento pela sua confiança.",
    features: [
      "Tudo do plano Clareza",
      "2 meses grátis",
      "Acesso antecipado a novidades",
    ],
    cta: "Assinar Plano Anual",
    highlighted: false,
  },
]

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")
  return (
    <section id="planos" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">Sua Faísca de Genialidade Começa Agora</h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Experimente o poder completo do Explicaê com 30 Faíscas gratuitas por 7 dias. Acesso total a todos os recursos premium. Sem mimimi, sem cartão de crédito.
          </p>
          <div className="pt-2">
            <Button asChild size="lg">
              <Link href="/signup" aria-label="Iniciar Meu Teste Gratuito de 7 Dias">Iniciar Meu Teste Gratuito de 7 Dias</Link>
            </Button>
          </div>

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

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
                <div className="space-y-1 text-center">
                <div className="text-4xl font-bold">
                  {formatBRL(billingPeriod === "annual" && (plan as any).priceAnnual ? (plan as any).priceAnnual : plan.price)}
                </div>
                <div className="text-muted-foreground">
                  {(plan as any).suffixLabel
                    ? (plan as any).suffixLabel
                    : plan.period === "/ano" || (billingPeriod === "annual" && (plan as any).priceAnnual)
                    ? "Por ano"
                    : "Por mês"}
                </div>
              </div>
                {((plan as any).subtitle || plan.description) && (
                  <p className="text-sm text-muted-foreground">{(plan as any).subtitle ?? plan.description}</p>
                )}
                
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
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
            *Sua confiança é nossa prioridade. O uso ilimitado está sujeito à nossa Política de Uso Justo de 3.000 Faíscas por mês para garantir a qualidade do serviço para todos.
          </p>
        </div>
      </div>
    </section>
  )
}
