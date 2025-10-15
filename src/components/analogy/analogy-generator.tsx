'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Lightbulb, Loader2, Heart, Copy, Share2 } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'

interface AnalogyResult {
  id: string
  analogy: string
  explanation: string
  usage_tips: string[]
  remaining_credits?: number
}

export function AnalogyGenerator() {
  const { userProfile } = useAuth()
  const [formData, setFormData] = useState({
    concept: '',
    audience: '',
    context: '',
    tone: 'casual' as 'formal' | 'casual' | 'humorous' | 'technical',
    length: 'medium' as 'short' | 'medium' | 'long'
  })
  const [result, setResult] = useState<AnalogyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/generate-analogy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar analogia')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToFavorites = async () => {
    if (!result) return

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generation_id: result.id,
          title: formData.concept
        }),
      })

      if (response.ok) {
        // Mostrar feedback de sucesso
        alert('Analogia salva nos favoritos!')
      }
    } catch (err) {
      console.error('Erro ao salvar favorito:', err)
    }
  }

  const handleCopyToClipboard = () => {
    if (!result) return
    
    const text = `${result.analogy}\n\n${result.explanation}`
    navigator.clipboard.writeText(text)
    alert('Analogia copiada para a área de transferência!')
  }

  const getRemainingCreditsText = () => {
    if (!userProfile) return ''
    
    if (userProfile.plan_type === 'credits') {
      const credits = result?.remaining_credits ?? userProfile.credits
      return `${credits} créditos restantes`
    }
    
    if (userProfile.plan_type === 'free_trial') {
      return 'Teste grátis'
    }
    
    return 'Plano ilimitado'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 rounded-lg p-3">
            <Lightbulb className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerador de Analogias</h2>
            <p className="text-gray-600">Transforme conceitos complexos em explicações simples</p>
          </div>
        </div>

        {userProfile && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Plano atual:</strong> {userProfile.plan_type === 'free_trial' ? 'Teste Grátis' : 
                userProfile.plan_type === 'credits' ? 'Créditos' : 
                userProfile.plan_type === 'monthly' ? 'Mensal' : 'Anual'} • {getRemainingCreditsText()}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conceito a explicar *
              </label>
              <Input
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                placeholder="Ex: Blockchain, Machine Learning, Fotossíntese..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Público-alvo *
              </label>
              <Input
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="Ex: crianças de 10 anos, executivos, estudantes..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contexto adicional (opcional)
            </label>
            <Textarea
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              placeholder="Forneça mais detalhes sobre o contexto, situação específica ou aspectos importantes..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tom da explicação
              </label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="humorous">Humorístico</option>
                <option value="technical">Técnico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho da analogia
              </label>
              <select
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="short">Concisa</option>
                <option value="medium">Moderada</option>
                <option value="long">Detalhada</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !formData.concept || !formData.audience}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando analogia...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Gerar Analogia
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Sua Analogia</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToFavorites}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Favoritar
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Analogia:</h4>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                {result.analogy}
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Explicação:</h4>
              <p className="text-gray-700 mb-4">
                {result.explanation}
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Dicas de uso:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {result.usage_tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            {result.remaining_credits !== undefined && (
              <p className="text-sm text-gray-600">
                Créditos restantes: {result.remaining_credits}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}