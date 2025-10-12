import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Descoberta",
      price: "Grátis",
      period: "7 dias",
      icon: Sparkles,
      description: "Teste todas as funcionalidades",
      features: [
        "100 gerações de analogias",
        "Banco de analogias pessoal",
        "Perfis de público-alvo",
        "Faísca criativa diária",
        "Analisador de clareza",
        "Sistema de badges",
      ],
      cta: "Começar teste grátis",
      href: "/auth/signup",
      highlighted: false,
    },
    {
      name: "Faísca",
      price: "R$ 29,90",
      period: "150 analogias",
      icon: Zap,
      description: "Recarregue quando precisar",
      features: [
        "150 gerações de analogias",
        "Banco de analogias pessoal",
        "Perfis de público-alvo",
        "Faísca criativa diária",
        "Analisador de clareza",
        "Sistema de badges",
      ],
      cta: "Comprar créditos",
      href: "#",
      kiwifyLink: true,
      highlighted: false,
    },
    {
      name: "Clareza",
      price: "R$ 24,90",
      period: "/mês",
      icon: Crown,
      description: "Gerações ilimitadas",
      features: [
        "Gerações ilimitadas",
        "Banco de analogias pessoal",
        "Perfis de público-alvo",
        "Faísca criativa diária",
        "Analisador de clareza",
        "Sistema de badges",
        "Suporte prioritário",
      ],
      cta: "Assinar agora",
      href: "#",
      kiwifyLink: true,
      highlighted: true,
    },
    {
      name: "Maestria",
      price: "R$ 249",
      period: "/ano",
      icon: Crown,
      description: "Melhor custo-benefício",
      features: [
        "Gerações ilimitadas",
        "Banco de analogias pessoal",
        "Perfis de público-alvo",
        "Faísca criativa diária",
        "Analisador de clareza",
        "Sistema de badges",
        "Suporte prioritário",
        "2 meses grátis",
      ],
      cta: "Assinar anual",
      href: "#",
      kiwifyLink: true,
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">Escolha o plano ideal para você</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Transforme conceitos complexos em analogias memoráveis
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-lg scale-105" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.kiwifyLink ? (
                    <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                      {plan.cta}
                    </Button>
                  ) : (
                    <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">Todos os planos incluem acesso completo às ferramentas do Explicaê</p>
        </div>
      </div>
    </div>
  )
}
