"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Analogy } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Copy, Search, Star, Tag, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Send, Twitter, Facebook, Linkedin, MessageCircle } from "lucide-react"

interface Analogy {
  id: string
  concept: string
  audience: string
  analogy_text: string
  category: string | null
  is_favorite: boolean
  created_at: string
}

interface AnalogyBankProps {
  initialAnalogies: Analogy[]
}

export function AnalogyBank({ initialAnalogies }: AnalogyBankProps) {
  const [analogies, setAnalogies] = useState<Analogy[]>(initialAnalogies)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [editingAnalogy, setEditingAnalogy] = useState<Analogy | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [sharingAnalogy, setSharingAnalogy] = useState<Analogy | null>(null) // Novo estado para o diálogo de compartilhamento
  const { toast } = useToast()

  const categories = useMemo(() => {
    const cats = new Set<string>()
    analogies.forEach((a) => {
      if (a.category) cats.add(a.category)
    })
    return Array.from(cats).sort()
  }, [analogies])

  const filteredAnalogies = useMemo(() => {
    return analogies.filter((analogy) => {
      const matchesSearch =
        analogy.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analogy.audience.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analogy.analogy_text.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = filterCategory === "all" || analogy.category === filterCategory

      const matchesFavorites = !filterFavorites || analogy.is_favorite

      return matchesSearch && matchesCategory && matchesFavorites
    })
  }, [analogies, searchQuery, filterCategory, filterFavorites])

  const toggleFavorite = async (analogy: Analogy) => {
    const supabase = createClient()
    const newFavoriteStatus = !analogy.is_favorite

    const { error } = await supabase.from("analogies").update({ is_favorite: newFavoriteStatus }).eq("id", analogy.id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o favorito.",
        variant: "destructive",
      })
      return
    }

    setAnalogies((prev) => prev.map((a) => (a.id === analogy.id ? { ...a, is_favorite: newFavoriteStatus } : a)))

    // Update user stats
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: stats } = await supabase
        .from("user_stats")
        .select("total_favorites")
        .eq("user_id", user.id)
        .single()

      const newTotal = newFavoriteStatus
        ? (stats?.total_favorites || 0) + 1
        : Math.max(0, (stats?.total_favorites || 0) - 1)

      await supabase.from("user_stats").update({ total_favorites: newTotal }).eq("user_id", user.id)
    }

    toast({
      title: newFavoriteStatus ? "Adicionado aos favoritos" : "Removido dos favoritos",
      description: newFavoriteStatus ? "Analogia marcada como favorita." : "Analogia desmarcada.",
    })
  }

  const copyAnalogy = (analogy: Analogy) => {
    navigator.clipboard.writeText(analogy.analogy_text)
    toast({
      title: "Copiado",
      description: "Analogia copiada para a área de transferência.",
    })
  }

  const shareAnalogy = (analogy: Analogy) => {
    setSharingAnalogy(analogy) // Abre o diálogo de compartilhamento
  }

  const deleteAnalogy = async (analogyId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta analogia?")) return

    const supabase = createClient()

    // Excluir a analogia sem afetar o contador total
    const { error } = await supabase.from("analogies").delete().eq("id", analogyId)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a analogia.",
        variant: "destructive",
      })
      return
    }

    setAnalogies((prev) => prev.filter((a) => a.id !== analogyId))
    toast({
      title: "Excluído",
      description: "Analogia removida do banco.",
    })
  }

  const updateCategory = async () => {
    if (!editingAnalogy) return

    const supabase = createClient()
    const { error } = await supabase
      .from("analogies")
      .update({ category: newCategory || null })
      .eq("id", editingAnalogy.id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      })
      return
    }

    setAnalogies((prev) => prev.map((a) => (a.id === editingAnalogy.id ? { ...a, category: newCategory || null } : a)))

    setEditingAnalogy(null)
    setNewCategory("")

    toast({
      title: "Categoria atualizada",
      description: "A categoria foi alterada com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por conceito, público ou texto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={filterFavorites ? "default" : "outline"}
              onClick={() => setFilterFavorites(!filterFavorites)}
              className="w-full md:w-auto"
            >
              <Star className={`mr-2 h-4 w-4 ${filterFavorites ? "fill-current" : ""}`} />
              Favoritos
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAnalogies.length} {filteredAnalogies.length === 1 ? "analogia encontrada" : "analogias encontradas"}
        </p>
      </div>

      {filteredAnalogies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma analogia encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAnalogies.map((analogy) => (
            <Card key={analogy.id} className="hover:border-accent transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{analogy.concept}</CardTitle>
                    <p className="text-sm text-muted-foreground">Para: {analogy.audience}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {analogy.category && (
                        <Badge variant="secondary">
                          <Tag className="mr-1 h-3 w-3" />
                          {analogy.category}
                        </Badge>
                      )}
                      {analogy.is_favorite && (
                        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                          <Star className="mr-1 h-3 w-3 fill-current" />
                          Favorito
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(analogy)}
                      title={analogy.is_favorite ? "Remover favorito" : "Favoritar"}
                    >
                      <Star className={`h-4 w-4 ${analogy.is_favorite ? "fill-current text-yellow-500" : ""}`} />
                      <span className="sr-only">{analogy.is_favorite ? "Remover favorito" : "Favoritar"}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingAnalogy(analogy)}
                      title="Editar categoria"
                    >
                      <Tag className="h-4 w-4" />
                      <span className="sr-only">Editar categoria</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyAnalogy(analogy)}
                      title="Copiar"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copiar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => shareAnalogy(analogy)}
                      title="Compartilhar"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Compartilhar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnalogy(analogy.id)}
                      title="Excluir"
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{analogy.analogy_text}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Criado em {new Date(analogy.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingAnalogy} onOpenChange={(open) => !open && setEditingAnalogy(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>Altere a categoria desta analogia para melhor organização.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Ex: Tecnologia, Ciência, Negócios..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAnalogy(null)}>
              Cancelar
            </Button>
            <Button onClick={updateCategory}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Novo Diálogo de Compartilhamento */}
      <Dialog open={!!sharingAnalogy} onOpenChange={(open) => !open && setSharingAnalogy(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Analogia</DialogTitle>
            <DialogDescription>Escolha onde você quer compartilhar esta analogia incrível!</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Button
              onClick={() => shareOnSocialMedia('twitter', sharingAnalogy?.content || '')}
              className='w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white'
            >
              <Twitter className='mr-2 h-4 w-4' /> Compartilhar no Twitter
            </Button>
            <Button
              onClick={() => shareOnSocialMedia('facebook', sharingAnalogy?.content || '')}
              className='w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white'
            >
              <Facebook className='mr-2 h-4 w-4' /> Compartilhar no Facebook
            </Button>
            <Button
              onClick={() => shareOnSocialMedia('linkedin', sharingAnalogy?.content || '')}
              className='w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white'
            >
              <Linkedin className='mr-2 h-4 w-4' /> Compartilhar no LinkedIn
            </Button>
            <Button
              onClick={() => shareOnSocialMedia('whatsapp', sharingAnalogy?.content || '')}
              className='w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white'
            >
              <MessageCircle className='mr-2 h-4 w-4' /> Compartilhar no WhatsApp
            </Button>
            <Button
              onClick={() => {
                if (sharingAnalogy?.content) {
                  navigator.clipboard.writeText(sharingAnalogy.content)
                  toast({
                    title: 'Copiado!',
                    description: 'A analogia foi copiada para a área de transferência.',
                  })
                }
                setSharingAnalogy(null)
              }}
              className='w-full'
            >
              Copiar para área de transferência
            </Button>
          </div>
          <DialogFooter>
            <Button type='button' variant='secondary' onClick={() => setSharingAnalogy(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
