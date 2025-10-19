"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MoreVertical, Mail, Ban, CheckCircle, Crown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Dados mockados removidos — usaremos dados reais do Supabase

interface User {
  id: string
  name: string
  email: string
  plan: string
  status: "active" | "suspended"
  analogies: number
  joined: string
  role?: string
}

export function AdminUsersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const supabase = createClient()

        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email, full_name, plan_type, subscription_status, created_at, role")

        if (profilesError) {
          console.error("Erro ao carregar perfis:", profilesError.message)
          setUsers([])
          setLoading(false)
          return
        }

        const { data: stats, error: statsError } = await supabase
          .from("user_stats")
          .select("user_id, total_analogies")

        if (statsError) {
          console.warn("Erro ao carregar stats:", statsError.message)
        }

        const countByUser: Record<string, number> = (stats || []).reduce((acc, s) => {
          acc[s.user_id] = s.total_analogies ?? 0
          return acc
        }, {} as Record<string, number>)

        const mapped: User[] = (profiles || []).map((p: any) => {
          const planLabel =
            p.role === "admin" ? "Admin" :
            p.plan_type === "gratuito" ? "Gratuito" :
            p.plan_type === "credito" ? "Crédito" :
            p.plan_type === "mensal" ? "Mensal" :
            p.plan_type === "anual" ? "Anual" :
            p.plan_type || "—"

          const statusLabel: "active" | "suspended" =
            p.subscription_status === "ativa" || p.subscription_status === "trial" ? "active" : "suspended"

          return {
            id: p.id,
            name: p.full_name ?? "Sem nome",
            email: p.email,
            plan: planLabel,
            status: statusLabel,
            analogies: countByUser[p.id] ?? 0,
            joined: p.created_at,
            role: p.role,
          }
        })

        setUsers(mapped)
      } catch (e) {
        console.error("Erro inesperado ao buscar usuários:", e)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>Exportar CSV</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuário</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plano</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Analogias</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Membro desde</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge variant={user.plan === "Admin" ? "default" : ["Pro","Mensal","Anual","Crédito"].includes(user.plan) ? "secondary" : "outline"}>
                    {user.plan === "Admin" && <Crown className="w-3 h-3 mr-1" />}
                    {user.plan}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status === "active" ? "Ativo" : "Suspenso"}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-foreground">{user.analogies}</td>
                <td className="py-4 px-4 text-muted-foreground">{new Date(user.joined).toLocaleDateString("pt-BR")}</td>
                <td className="py-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Ban className="w-4 h-4 mr-2" />
                        Suspender Conta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Próxima
          </Button>
        </div>
      </div>
    </Card>
  )
}
