import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowRight } from "lucide-react"

export function PricingCTA() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Pronto para Começar?</h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              Comece gratuitamente hoje e transforme a forma como você explica conceitos complexos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2">
                Experimentar Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent">
                Falar com Vendas
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Sem cartão de crédito necessário • Cancele quando quiser</p>
          </div>
        </Card>
      </div>
    </section>
  )
}
