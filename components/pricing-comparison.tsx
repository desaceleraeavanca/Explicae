import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"

const features = [
  {
    category: "Geração de Analogias",
    items: [
      { name: "Analogias por mês", free: "30 faíscas", clarity: "Ilimitado", team: "Ilimitado" },
      { name: "Dialetos de audiência", free: "Padrões", clarity: "Ilimitados", team: "Ilimitados + Personalizados" },
      { name: "Tons de comunicação", free: true, clarity: true, team: true },
      { name: "Contexto personalizado", free: true, clarity: true, team: true },
    ],
  },
  {
    category: "Banco de Analogias",
    items: [
      { name: "Armazenamento", free: "Até 50", clarity: "Ilimitado", team: "Ilimitado" },
      { name: "Organização por tags", free: true, clarity: true, team: true },
      { name: "Busca avançada", free: false, clarity: true, team: true },
      { name: "Compartilhamento", free: false, clarity: false, team: true },
    ],
  },
  {
    category: "Análise e Insights",
    items: [
      { name: "Analisador de clareza", free: "Básico", clarity: "Avançado", team: "Avançado + Analytics" },
      { name: "Pontuação de clareza", free: true, clarity: true, team: true },
      { name: "Sugestões de melhoria", free: "Limitadas", clarity: "Completas", team: "Completas + IA" },
      { name: "Relatórios de uso", free: false, clarity: false, team: true },
    ],
  },
  {
    category: "Colaboração",
    items: [
      { name: "Membros da equipe", free: "1", clarity: "1", team: "Até 10" },
      { name: "Workspace compartilhado", free: false, clarity: false, team: true },
      { name: "Comentários e feedback", free: false, clarity: false, team: true },
      { name: "Permissões de acesso", free: false, clarity: false, team: true },
    ],
  },
  {
    category: "Suporte",
    items: [
      { name: "Base de conhecimento", free: true, clarity: true, team: true },
      { name: "Suporte por email", free: false, clarity: true, team: true },
      { name: "Suporte prioritário", free: false, clarity: false, team: true },
      { name: "Onboarding personalizado", free: false, clarity: false, team: true },
    ],
  },
]

export function PricingComparison() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Compare os Planos</h2>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            Veja todos os recursos disponíveis em cada plano
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <CardTitle className="text-base">Recursos</CardTitle>
              </div>
              <div className="text-center">
                <CardTitle className="text-base">Descoberta</CardTitle>
              </div>
              <div className="text-center">
                <CardTitle className="text-base">Clareza</CardTitle>
              </div>
              <div className="text-center">
                <CardTitle className="text-base">Equipe</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {features.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">{category.category}</h3>
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-border">
                    <div className="col-span-1">
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <div className="text-center">
                      {typeof item.free === "boolean" ? (
                        item.free ? (
                          <Check className="w-5 h-5 text-accent mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{item.free}</span>
                      )}
                    </div>
                    <div className="text-center">
                      {typeof item.clarity === "boolean" ? (
                        item.clarity ? (
                          <Check className="w-5 h-5 text-accent mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{item.clarity}</span>
                      )}
                    </div>
                    <div className="text-center">
                      {typeof item.team === "boolean" ? (
                        item.team ? (
                          <Check className="w-5 h-5 text-accent mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{item.team}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
