import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
            <Sparkles className="w-4 h-4" />
            Ferramenta de Geração de Analogias Criativas
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-balance leading-[1.12] md:leading-tight tracking-tight">
            <span className="block font-medium">Transforme ideias complexas em</span>
            <span className="block font-extrabold text-primary">explicações memoráveis</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
            Capacite-se para tornar conceitos abstratos e técnicos em analogias claras, envolventes e personalizadas
            para qualquer público.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 h-12" asChild>
              <Link href="/signup">
                Experimentar Grátis por 7 Dias
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="pt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground text-center">
              <span className="whitespace-nowrap">Confiado por profissionais de comunicação,</span><wbr /><span className="whitespace-nowrap"> educação e vendas</span>
            </p>
            {/* Mobile: duas linhas separadas */}
            <div className="flex flex-col items-center gap-3 sm:hidden opacity-90">
              <ul className="flex justify-center gap-3">
                <li><span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Professores</span></li>
                <li><span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Palestrantes</span></li>
                <li><span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Vendedores</span></li>
              </ul>
              <ul className="flex justify-center gap-3">
                <li><span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Criadores</span></li>
                <li><span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Estudantes</span></li>
              </ul>
            </div>

            {/* Desktop/tablet: única linha */}
            <ul className="hidden sm:flex sm:flex-nowrap sm:justify-center sm:gap-4 opacity-90">
              <li>
                 <span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Professores</span>
               </li>
              <li>
                 <span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Palestrantes</span>
               </li>
              <li>
                 <span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Vendedores</span>
               </li>
              <li className="col-start-2">
                 <span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Criadores</span>
               </li>
              <li className="col-start-3">
                 <span className="text-xs font-medium whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 text-primary px-2.5 py-1 md:px-3 md:py-1.5 hover:bg-primary/15 transition-colors">Estudantes</span>
               </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
