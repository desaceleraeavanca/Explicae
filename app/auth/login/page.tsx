import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Mail, Lock, Eye, Lightbulb } from "lucide-react"
import Link from "next/link"
import { login } from './actions'
import Image from "next/image"

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams.error

  return (
    <div className="flex h-screen">
      {/* Coluna de Login */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explicaê</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Boas-vindas de volta!</p>
            <p className="text-gray-500 dark:text-gray-400">Crie analogias poderosas com IA.</p>
          </div>
          
          <form action={login} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="pl-10 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                  <Eye className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="#" className="font-medium text-primary hover:text-primary/80">
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>
            
            {error && <p className="text-sm text-red-600">{error}</p>}
            
            <div className="mt-8 space-y-4">
              <Button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90">
                Entrar
              </Button>
              
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cadastrar
                </Button>
              </Link>
            </div>
          </form>
          
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">ou</span>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Entrar com Google
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta? <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">Cadastre-se</Link>
          </div>
        </div>
      </div>
      
      {/* Coluna de Destaque - Visível apenas em telas grandes */}
      <div className="hidden lg:flex flex-1 bg-gray-100 dark:bg-gray-900 items-center justify-center p-16">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Lightbulb className="h-20 w-20 text-primary" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Comunicação que conecta.</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Transforme conceitos complexos em ideias simples e memoráveis.</p>
        </div>
      </div>
    </div>
  )
}
