import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lightbulb, Users, Trophy, Zap, ArrowRight, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-purple-600">Explicaê</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transforme <span className="text-purple-600">complexidade</span> em{' '}
            <span className="text-blue-600">clareza</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crie analogias poderosas que fazem seus conceitos complexos serem compreendidos 
            instantaneamente por qualquer público.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Ver Demonstração
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>Teste grátis • Sem cartão de crédito</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Tudo que você precisa para comunicar melhor
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ferramentas inteligentes para criar, organizar e aperfeiçoar suas analogias
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Gerador IA</h4>
            <p className="text-gray-600">
              Crie analogias personalizadas com inteligência artificial avançada
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Perfis de Público</h4>
            <p className="text-gray-600">
              Adapte sua linguagem para diferentes audiências automaticamente
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Sistema de Badges</h4>
            <p className="text-gray-600">
              Ganhe conquistas e acompanhe seu progresso na comunicação
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 rounded-lg p-3 w-fit mb-4">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Faísca Diária</h4>
            <p className="text-gray-600">
              Receba inspiração diária com analogias criativas e inovadoras
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para comunicar com clareza?
          </h3>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já transformaram sua comunicação
          </p>
          
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Lightbulb className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold">Explicaê</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white">Privacidade</Link>
              <Link href="/terms" className="hover:text-white">Termos</Link>
              <Link href="/contact" className="hover:text-white">Contato</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Explicaê. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
