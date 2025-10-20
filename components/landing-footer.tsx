import { Lightbulb } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-border pt-6 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 md:divide-x md:divide-border">
          <div className="space-y-4 md:px-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Explicaê</span>
            </div>
            <p className="text-sm text-muted-foreground text-center mx-auto">Transforme ideias complexas em explicações memoráveis</p>
          </div>

          <div className="space-y-4 md:px-6 text-center">
            <h4 className="font-semibold">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Recursos</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Galeria de Faíscas</a></li>
            </ul>
          </div>

          <div className="space-y-4 md:px-6 text-center">
            <h4 className="font-semibold">Explicaê</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Nossa Missão</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Parceria</a></li>
            </ul>
          </div>

          <div className="space-y-4 md:px-6 text-center">
            <h4 className="font-semibold">Suporte & Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/help" className="hover:text-foreground transition-colors">Central de Ajuda</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Termos de Serviço</a></li>
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 -mx-4 border-t border-border">
        <div className="container mx-auto max-w-6xl py-4 text-center text-[15px] text-muted-foreground">
          <p>© 2025 Explicaê. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
