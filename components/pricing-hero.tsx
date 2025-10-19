"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Descoberta",
    price: 0,
    period: "7 dias",
    description: "Experimente a ferramenta sem compromisso",
    features: [
      "30 faíscas (90 analogias)",
      "Acesso a todos os recursos",
      "Banco de analogias",
      "Dialetos de público",
      "Analisador de clareza",
    ],
    cta: "Começar Grátis",
    highlighted: false,
    popular: false,
  },
  {
    name: "Clareza",
    price: 24.9,
    priceAnnual: 249,
    period: "/mês",
    description: "Para profissionais que usam regularmente",
    features: [
      "Analogias ilimitadas",
      "Banco de analogias ilimitado",
      "Dialetos de público ilimitados",
      "Analisador de clareza avançado",
      "Faísca criativa diária",
      "Sistema de conquistas",
      "Exportação em múltiplos formatos",
      "Suporte por email",
    ],
    cta: "Assinar Agora",
    highlighted: true,
    popular: true,
  },
  {
    name: "Equipe",
    price: 89.9,
    priceAnnual: 899,
    period: "/mês",
    description: "Para times que precisam colaborar",
    features: [
      "Tudo do plano Clareza",
      "Até 10 membros da equipe",
      "Workspace compartilhado",
      "Banco de analogias da equipe",
      "Dialetos personalizados da empresa",
      "Análise de uso da equipe",
      "Suporte prioritário",
      "Onboarding personalizado",
    ],
    cta: "Falar com Vendas",
    highlighted: false,
    popular: false,
  },
]

export function PricingHero() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")

  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-6 mb-12">
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="w-3 h-3" />
            Planos e Preços
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance">Escolha o Plano Ideal para Você</h1>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Comece grátis e escale conforme suas necessidades crescem
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant={billingPeriod === "monthly" ? "default" : "outline"}
              onClick={() => setBillingPeriod("monthly")}
              className="bg-transparent"
            >
              Mensal
            </Button>
            <Button
              variant={billingPeriod === "annual" ? "default" : "outline"}
              onClick={() => setBillingPeriod("annual")}
              className="bg-transparent"
            >
              Anual
              <Badge variant="secondary" className="ml-2">
                Economize 17%
              </Badge>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                "p-8 space-y-6 relative transition-all",
                plan.highlighted && "border-primary shadow-xl scale-105 bg-card",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Mais Popular
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                {plan.price === 0 ? (
                  <span className="text-4xl font-bold text-foreground">Grátis</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-foreground">
                      R$ {billingPeriod === "annual" && plan.priceAnnual ? plan.priceAnnual : plan.price}
                    </span>
                    <span className="text-muted-foreground">{billingPeriod === "annual" ? "/ano" : plan.period}</span>
                  </>
                )}
              </div>

              {billingPeriod === "annual" && plan.priceAnnual && (
                <p className="text-sm text-secondary font-medium">
                  Equivalente a R$ {(plan.priceAnnual / 12).toFixed(2)}/mês
                </p>
              )}

              <Button
                className={cn("w-full", plan.highlighted && "bg-primary hover:bg-primary/90")}
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
              >
                {plan.cta}
              </Button>

              <div className="space-y-3 pt-4 border-t border-border">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="inline-block p-6 bg-secondary/10 border-secondary/20">
            <p className="text-sm font-medium text-foreground">
              <span className="text-secondary font-bold">Pacote de Faíscas:</span> R$ 34,90 por 300 analogias (válido
              por 12 meses)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Ideal para quem quer flexibilidade sem compromisso mensal
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
