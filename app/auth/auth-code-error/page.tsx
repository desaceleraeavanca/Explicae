import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-mint-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro na Autenticação</h1>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro ao processar sua autenticação. Por favor, tente fazer login novamente.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Voltar para Login</Link>
        </Button>
      </div>
    </div>
  )
}
