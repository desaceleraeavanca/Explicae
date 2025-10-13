"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  details: any
  ip_address: string | null
  created_at: string
  profiles: {
    email: string
    full_name: string | null
  } | null
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [searchTerm, actionFilter, logs])

  async function loadLogs() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error && data) {
      setLogs(data as any)
    }
    setLoading(false)
  }

  function filterLogs() {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    setFilteredLogs(filtered)
  }

  function getActionColor(action: string) {
    if (action.includes("create") || action.includes("insert")) return "bg-green-500"
    if (action.includes("update") || action.includes("edit")) return "bg-blue-500"
    if (action.includes("delete") || action.includes("remove")) return "bg-red-500"
    if (action.includes("login") || action.includes("auth")) return "bg-purple-500"
    return "bg-gray-500"
  }

  if (loading) {
    return <Card className="p-6">Carregando logs...</Card>
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Logs de Auditoria</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ação, recurso ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            <SelectItem value="create">Criar</SelectItem>
            <SelectItem value="update">Atualizar</SelectItem>
            <SelectItem value="delete">Deletar</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ação</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum log encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.profiles?.full_name || "Sistema"}</p>
                      <p className="text-sm text-muted-foreground">{log.profiles?.email || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.resource_type}</p>
                      {log.resource_id && <p className="text-xs text-muted-foreground">{log.resource_id}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{log.ip_address || "-"}</span>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {filteredLogs.length} de {logs.length} logs (últimos 100)
      </div>
    </Card>
  )
}
