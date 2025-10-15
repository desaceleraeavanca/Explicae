'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Heart, Copy, Trash2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface FavoriteAnalogy {
  id: string
  title: string
  created_at: string
  generations: {
    concept: string
    audience: string
    analogy: string
    explanation: string
    usage_tips: string[]
    created_at: string
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteAnalogy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites?id=${favoriteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.id !== favoriteId))
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
    }
  }

  const handleCopyToClipboard = (analogy: string, explanation: string) => {
    const text = `${analogy}\n\n${explanation}`
    navigator.clipboard.writeText(text)
    alert('Analogia copiada para a área de transferência!')
  }

  const filteredFavorites = favorites.filter(favorite =>
    favorite.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.generations.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.generations.audience.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando favoritos...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-100 rounded-lg p-3">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analogias Favoritas</h2>
              <p className="text-gray-600">Suas analogias salvas para referência rápida</p>
            </div>
          </div>

          {/* Barra de pesquisa */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar favoritos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum favorito encontrado' : 'Nenhuma analogia favorita ainda'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente pesquisar com outros termos'
                  : 'Comece gerando analogias e salvando suas favoritas'
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <a href="/dashboard">Gerar Analogia</a>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredFavorites.map((favorite) => (
                <div key={favorite.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {favorite.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Para: {favorite.generations.audience} • 
                        Salvo em {new Date(favorite.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToClipboard(
                          favorite.generations.analogy,
                          favorite.generations.explanation
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Analogia:</h4>
                    <p className="text-gray-700 mb-4">
                      {favorite.generations.analogy}
                    </p>

                    <h4 className="font-semibold text-gray-900 mb-2">Explicação:</h4>
                    <p className="text-gray-700 mb-4">
                      {favorite.generations.explanation}
                    </p>

                    <h4 className="font-semibold text-gray-900 mb-2">Dicas de uso:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {favorite.generations.usage_tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}