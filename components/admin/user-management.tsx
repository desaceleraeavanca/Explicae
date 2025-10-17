"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Shield, CreditCard } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UserDetailsDialog } from "./user-details-dialog"

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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, planFilter, statusFilter, users])

  async function loadUsers() {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  function filterUsers() {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (planFilter !== "all") {
      filtered = filtered.filter((user) => user.plan_type === planFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.subscription_status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  function getPlanBadge(plan: string) {
    const colors: Record<string, string> = {
      gratuito: "bg-gray-500",
      credito: "bg-blue-500",
      mensal: "bg-green-500",
      anual: "bg-purple-500",
      admin: "bg-red-500",
    }
    return colors[plan] || "bg-gray-500"
  }

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      ativa: "bg-green-500",
      pendente: "bg-yellow-500",
      cancelada: "bg-red-500",
    }
    return colors[status] || "bg-gray-500"
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planos</SelectItem>
              <SelectItem value="gratuito">Gratuito</SelectItem>
              <SelectItem value="credito">Crédito</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativa">Ativa</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || "Sem nome"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.role === "admin" && (
                        <Badge variant="outline" className="mt-1">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanBadge(user.plan_type)}>{user.plan_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(user.subscription_status)}>{user.subscription_status}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.plan_type === "credito" ? (
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {user.credits_remaining}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserDetailsDialog user={user} onUpdate={loadUsers} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </div>
      </Card>
    </div>
  )
}
