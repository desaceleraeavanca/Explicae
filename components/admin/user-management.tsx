"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Shield, CreditCard, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UserDetailsDialog } from "./user-details-dialog"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

  const { toast } = useToast()
  const [fixEmail, setFixEmail] = useState("")
  const [fixCredits, setFixCredits] = useState("")
  const [fixExpiry, setFixExpiry] = useState("")
  const [fixLoading, setFixLoading] = useState(false)
  const [overwriteExpiry, setOverwriteExpiry] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  async function alignCredits() {
    if (!fixEmail) {
      toast({ title: "Informe o email", description: "Digite o email do usuário para alinhar.", variant: "destructive" })
      return
    }
    const proceed = confirm("Isso irá alinhar créditos e, opcionalmente, validade. Continuar?")
    if (!proceed) return
    setFixLoading(true)
    try {
      const body: any = { email: fixEmail.trim(), overwrite_expiry: overwriteExpiry }
      if (fixCredits) {
        const num = Number(fixCredits)
        if (!Number.isFinite(num) || num < 0) {
          throw new Error("Créditos inválidos")
        }
        body.credits_remaining = num
      }
      if (fixExpiry) {
        const d = new Date(fixExpiry)
        if (isNaN(d.getTime())) {
          throw new Error("Data de validade inválida")
        }
        body.expiry_date = d.toISOString()
      }
      const res = await fetch("/api/admin/fix-user-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Falha ao alinhar créditos")
      }
      toast({ title: "Créditos alinhados", description: `Usuário: ${data.profile.email}` })
      setFixEmail("")
      setFixCredits("")
      setFixExpiry("")
      setOverwriteExpiry(false)
      await loadUsers()
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Falha inesperada", variant: "destructive" })
    } finally {
      setFixLoading(false)
    }
  }

  function openDeleteDialog(user: User) {
    setUserToDelete(user)
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!userToDelete) return
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDelete.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Falha ao excluir usuário")
      }
      toast({ title: "Usuário excluído", description: userToDelete.email })
      setDeleteOpen(false)
      setUserToDelete(null)
      await loadUsers()
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Falha inesperada", variant: "destructive" })
    }
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

        {/* Bloco de alinhamento de créditos por email */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="md:col-span-2">
            <Label htmlFor="fixEmail">Email do usuário</Label>
            <Input id="fixEmail" placeholder="usuario@email.com" value={fixEmail} onChange={(e) => setFixEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fixCredits">Créditos (opcional)</Label>
            <Input id="fixCredits" type="number" placeholder="ex: 300" value={fixCredits} onChange={(e) => setFixCredits(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fixExpiry">Validade (opcional)</Label>
            <Input id="fixExpiry" type="date" value={fixExpiry} onChange={(e) => setFixExpiry(e.target.value)} />
          </div>
          <div className="md:col-span-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={overwriteExpiry} onChange={(e) => setOverwriteExpiry(e.target.checked)} />
              Sobrescrever validade existente
            </label>
            <Button onClick={alignCredits} disabled={fixLoading}>
              {fixLoading ? "Alinhando..." : "Alinhar créditos"}
            </Button>
          </div>
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
                    <div className="flex justify-end gap-2">
                      <UserDetailsDialog user={user} onUpdate={loadUsers} />
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(user)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </div>
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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              Esta ação é permanente e remove o usuário e seus dados associados. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
