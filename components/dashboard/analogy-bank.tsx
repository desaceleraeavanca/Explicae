"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Star, Copy, Trash2, MoreVertical, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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

  const deleteAnalogy = async (analogy: Analogy) => {
    if (!confirm("Tem certeza que deseja excluir esta analogia?")) return

    const supabase = createClient()
    
    // Excluir a analogia sem afetar o contador total
    const { error } = await supabase.from("analogies").delete().eq("id", analogy.id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a analogia.",
        variant: "destructive",
      })
      return
    }

    setAnalogies((prev) => prev.filter((a) => a.id !== analogy.id))
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleFavorite(analogy)}>
                        <Star className="mr-2 h-4 w-4" />
                        {analogy.is_favorite ? "Remover favorito" : "Adicionar favorito"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingAnalogy(analogy)
                          setNewCategory(analogy.category || "")
                        }}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        Editar categoria
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyAnalogy(analogy)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteAnalogy(analogy)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
    </div>
  )
}
