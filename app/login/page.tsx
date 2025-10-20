import { LoginForm } from "@/components/login-form"
import { Lightbulb } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center text-lg font-medium">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-2">
            <Lightbulb className="w-6 h-6" />
          </div>
          Explicaê
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground text-balance">
            Transforme ideias complexas em analogias memoráveis
          </h1>
          <p className="text-lg text-primary-foreground/90 text-pretty">
            Junte-se a milhares de profissionais que já melhoraram sua comunicação com o poder da IA.
          </p>

          {/* Testimonial */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
            <p className="text-primary-foreground/95 mb-4 italic">
              "O Explicaê revolucionou a forma como explico conceitos técnicos para minha equipe. As analogias são
              perfeitas!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-sm font-semibold">
                MC
              </div>
              <div>
                <p className="font-semibold text-primary-foreground">Maria Clara</p>
                <p className="text-sm text-primary-foreground/80">Gerente de Produto</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-primary-foreground/70 text-sm">
          © 2025 Explicaê. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-foreground">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">Explicaê</span>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-foreground">Bem-vindo de volta</h2>
              <p className="text-muted-foreground">Entre com sua conta para continuar criando analogias incríveis</p>
            </div>

            <LoginForm />

            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
