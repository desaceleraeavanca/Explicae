import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center">
          <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />

          <div className="relative space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground text-balance">
              Pronto para transformar suas explicações?
            </h2>
            <p className="text-xl text-primary-foreground/90 text-balance max-w-2xl mx-auto">
              Comece gratuitamente hoje e descubra como analogias criativas podem revolucionar sua comunicação.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" className="text-lg px-8 h-12" asChild>
                <Link href="/signup">
                  Experimentar Grátis por 7 Dias
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
