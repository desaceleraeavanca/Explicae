"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical } from "lucide-react"

interface User {
  id: string
  email: string
  full_name: string | null
  plan_type: string
  subscription_status: string
  role: string
  credits_remaining: number
  created_at: string
  trial_ends_at: string | null
}

interface UserDetailsDialogProps {
  user: User
  onUpdate: () => void
}

export function UserDetailsDialog({ user, onUpdate }: UserDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    plan_type: user.plan_type,
    subscription_status: user.subscription_status,
    role: user.role,
    credits_remaining: user.credits_remaining,
  })
  const { toast } = useToast()
  const [alignLoading, setAlignLoading] = useState(false)

  async function alignCreditsQuick() {
    setAlignLoading(true)
    try {
      const res = await fetch("/api/admin/fix-user-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, overwrite_expiry: false }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Falha ao alinhar")
      toast({ title: "Créditos alinhados", description: `Usuário: ${user.email}` })
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Falha inesperada", variant: "destructive" })
    } finally {
      setAlignLoading(false)
    }
  }

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("profiles").update(formData).eq("id", user.id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      })
      setOpen(false)
      onUpdate()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>Visualize e edite as informações do usuário</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>

          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select
                value={formData.plan_type}
                onValueChange={(value) => setFormData({ ...formData, plan_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gratuito">Gratuito</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cortesia">Cortesia</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="parceria">Parceria</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.subscription_status}
                onValueChange={(value) => setFormData({ ...formData, subscription_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Créditos</Label>
              <Input
                type="number"
                value={formData.credits_remaining}
                onChange={(e) => setFormData({ ...formData, credits_remaining: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={alignCreditsQuick} disabled={alignLoading}>
            {alignLoading ? "Alinhando..." : "Alinhar créditos"}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
