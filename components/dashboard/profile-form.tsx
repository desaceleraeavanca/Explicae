"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ProfileFormProps {
  profile: {
    id: string
    email: string
    full_name: string | null
    plan_type: string
    subscription_status: string
    credits_remaining: number | null
    trial_ends_at: string | null
    created_at: string
  }
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id)

    if (error) {
      setMessage("Erro ao atualizar perfil: " + error.message)
    } else {
      setMessage("Perfil atualizado com sucesso!")
      router.refresh()
    }

    setIsLoading(false)
  }

  const getPlanName = (planType: string) => {
    switch (planType) {
      case "gratuito":
        return "Descoberta (Gratuito)"
      case "credito":
        return "Faísca (Créditos)"
      case "mensal":
        return "Clareza (Mensal)"
      case "anual":
        return "Maestria (Anual)"
      default:
        return planType
    }
  }

  const getStatusName = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "trial":
        return "Período de Teste"
      case "cancelled":
        return "Cancelado"
      case "expired":
        return "Expirado"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize suas informações de perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={userEmail} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            {message && (
              <div className={`text-sm ${message.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </div>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Assinatura</CardTitle>
          <CardDescription>Detalhes do seu plano atual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Plano Atual</Label>
              <p className="text-lg font-semibold">{getPlanName(profile.plan_type)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <p className="text-lg font-semibold">{getStatusName(profile.subscription_status)}</p>
            </div>
          </div>

          {profile.credits_remaining !== null && (
            <div>
              <Label className="text-muted-foreground">Créditos Restantes</Label>
              <p className="text-lg font-semibold">{profile.credits_remaining} analogias</p>
            </div>
          )}

          {profile.trial_ends_at && (
            <div>
              <Label className="text-muted-foreground">Período de Teste Termina</Label>
              <p className="text-lg font-semibold">{new Date(profile.trial_ends_at).toLocaleDateString("pt-BR")}</p>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground">Membro Desde</Label>
            <p className="text-lg font-semibold">{new Date(profile.created_at).toLocaleDateString("pt-BR")}</p>
          </div>

          <Button asChild variant="outline" className="w-full bg-transparent">
            <a href="/pricing">Gerenciar Plano</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
