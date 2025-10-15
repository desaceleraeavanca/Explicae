import { AnalogyGenerator } from "@/components/analogy-generator"
import { Lightbulb } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="rounded-2xl bg-accent p-3">
                <Lightbulb className="h-8 w-8 text-accent-foreground" />
              </div>
              <h1 className="font-sans text-5xl font-bold tracking-tight text-foreground md:text-6xl">Explicaê</h1>
            </div>
            <p className="text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
              Transforme conceitos complexos em analogias criativas e memoráveis.
              <br />
              <span className="text-foreground font-medium">O segredo dos grandes comunicadores.</span>
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="font-semibold">
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="font-semibold bg-transparent">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Component */}
          <AnalogyGenerator />

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              Criado para comunicadores, professores e criadores de conteúdo que querem gerar aquele momento{" "}
              <span className="font-bold text-accent">"AHA!"</span> 💡
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
