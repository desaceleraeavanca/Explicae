import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-purple-600">Explicaê</h1>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <AuthForm mode="signup" />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/auth/signin" className="font-medium text-purple-600 hover:text-purple-500">
                Faça login
              </Link>
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}