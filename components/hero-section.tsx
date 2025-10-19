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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Ferramenta de Geração de Analogias Criativas
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight">
            Transforme ideias complexas em <span className="text-primary">explicações memoráveis</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
            Capacite-se para tornar conceitos abstratos e técnicos em analogias claras, envolventes e personalizadas
            para qualquer público.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 h-12" asChild>
              <Link href="/signup">
                Experimentar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-12 bg-transparent" asChild>
              <a href="#como-funciona">Ver Como Funciona</a>
            </Button>
          </div>

          {/* Social proof */}
          <div className="pt-8 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Confiado por profissionais de comunicação, educação e vendas
            </p>
            <div className="flex items-center gap-6 opacity-60">
              <div className="text-xs font-medium">Professores</div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <div className="text-xs font-medium">Palestrantes</div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <div className="text-xs font-medium">Criadores de Conteúdo</div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <div className="text-xs font-medium">Vendedores</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
