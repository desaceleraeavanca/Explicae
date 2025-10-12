"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Users, MoreVertical, Edit, Trash2, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface AudienceProfile {
  id: string
  name: string
  description: string
  context: string | null
  age_range: string | null
  interests: string[] | null
  created_at: string
}

interface AudienceProfilesProps {
  initialAudiences: AudienceProfile[]
}

export function AudienceProfiles({ initialAudiences }: AudienceProfilesProps) {
  const [audiences, setAudiences] = useState<AudienceProfile[]>(initialAudiences)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAudience, setEditingAudience] = useState<AudienceProfile | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    context: "",
    age_range: "",
    interests: "",
  })
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      context: "",
      age_range: "",
      interests: "",
    })
  }

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e a descrição do público.",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const interestsArray = formData.interests
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0)

    const { data, error } = await supabase
      .from("audience_profiles")
      .insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        context: formData.context || null,
        age_range: formData.age_range || null,
        interests: interestsArray.length > 0 ? interestsArray : null,
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao criar perfil",
        description: "Não foi possível criar o perfil de público.",
        variant: "destructive",
      })
      return
    }

    setAudiences((prev) => [data, ...prev])
    setIsCreateOpen(false)
    resetForm()

    toast({
      title: "Perfil criado",
      description: "O perfil de público foi criado com sucesso.",
    })
  }

  const handleUpdate = async () => {
    if (!editingAudience) return

    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e a descrição do público.",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()

    const interestsArray = formData.interests
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0)

    const { data, error } = await supabase
      .from("audience_profiles")
      .update({
        name: formData.name,
        description: formData.description,
        context: formData.context || null,
        age_range: formData.age_range || null,
        interests: interestsArray.length > 0 ? interestsArray : null,
      })
      .eq("id", editingAudience.id)
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      })
      return
    }

    setAudiences((prev) => prev.map((a) => (a.id === editingAudience.id ? data : a)))
    setEditingAudience(null)
    resetForm()

    toast({
      title: "Perfil atualizado",
      description: "O perfil foi atualizado com sucesso.",
    })
  }

  const handleDelete = async (audience: AudienceProfile) => {
    if (!confirm(`Tem certeza que deseja excluir o perfil "${audience.name}"?`)) return

    const supabase = createClient()
    const { error } = await supabase.from("audience_profiles").delete().eq("id", audience.id)

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o perfil.",
        variant: "destructive",
      })
      return
    }

    setAudiences((prev) => prev.filter((a) => a.id !== audience.id))

    toast({
      title: "Perfil excluído",
      description: "O perfil foi removido com sucesso.",
    })
  }

  const openEditDialog = (audience: AudienceProfile) => {
    setEditingAudience(audience)
    setFormData({
      name: audience.name,
      description: audience.description,
      context: audience.context || "",
      age_range: audience.age_range || "",
      interests: audience.interests?.join(", ") || "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {audiences.length} {audiences.length === 1 ? "perfil criado" : "perfis criados"}
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Perfil de Público</DialogTitle>
              <DialogDescription>Defina um perfil reutilizável para um público-alvo específico</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Perfil</Label>
                <Input
                  id="name"
                  placeholder="Ex: Adolescentes Gen Z, Idosos Iniciantes..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o público-alvo em detalhes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Contexto Adicional (opcional)</Label>
                <Textarea
                  id="context"
                  placeholder="Informações extras sobre o público, comportamentos, preferências..."
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_range">Faixa Etária (opcional)</Label>
                  <Input
                    id="age_range"
                    placeholder="Ex: 15-18 anos"
                    value={formData.age_range}
                    onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interesses (opcional)</Label>
                  <Input
                    id="interests"
                    placeholder="Separados por vírgula"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Criar Perfil</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {audiences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Você ainda não criou nenhum perfil de público.</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Perfil
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {audiences.map((audience) => (
            <Card key={audience.id} className="hover:border-accent transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{audience.name}</CardTitle>
                    <CardDescription>{audience.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(audience)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(audience)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {audience.context && (
                  <div>
                    <p className="text-sm font-medium mb-1">Contexto:</p>
                    <p className="text-sm text-muted-foreground">{audience.context}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {audience.age_range && (
                    <Badge variant="secondary">
                      <Users className="mr-1 h-3 w-3" />
                      {audience.age_range}
                    </Badge>
                  )}
                  {audience.interests &&
                    audience.interests.map((interest) => (
                      <Badge key={interest} variant="outline">
                        <Tag className="mr-1 h-3 w-3" />
                        {interest}
                      </Badge>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Criado em {new Date(audience.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingAudience} onOpenChange={(open) => !open && setEditingAudience(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Perfil de Público</DialogTitle>
            <DialogDescription>Atualize as informações do perfil</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Perfil</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Adolescentes Gen Z, Idosos Iniciantes..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Descreva o público-alvo em detalhes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-context">Contexto Adicional (opcional)</Label>
              <Textarea
                id="edit-context"
                placeholder="Informações extras sobre o público, comportamentos, preferências..."
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age_range">Faixa Etária (opcional)</Label>
                <Input
                  id="edit-age_range"
                  placeholder="Ex: 15-18 anos"
                  value={formData.age_range}
                  onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-interests">Interesses (opcional)</Label>
                <Input
                  id="edit-interests"
                  placeholder="Separados por vírgula"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingAudience(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
