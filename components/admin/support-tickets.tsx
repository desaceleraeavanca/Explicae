"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { MessageSquare, Clock, CheckCircle2, XCircle, FileText, SlidersHorizontal, Ticket as TicketIcon, Trash2, MoreVertical, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface Ticket {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  updates_count?: number
  profiles: {
    email: string
    full_name: string | null
  }
}

const statusConfig = {
  pendente: { label: "Pendente", icon: <Clock className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800" },
  em_andamento: { label: "Em Andamento", icon: <SlidersHorizontal className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
  resolvido: { label: "Resolvido", icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
  fechado: { label: "Fechado", icon: <XCircle className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
} as const;

const priorityConfig = {
  baixa: { label: "Baixa", color: "bg-gray-100 text-gray-800" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-800" },
  alta: { label: "Alta", color: "bg-yellow-100 text-yellow-800" },
  urgente: { label: "Urgente", color: "bg-red-100 text-red-800" },
} as const;

const exportTicketsCsv = (tickets: Ticket[]) => {
  const headers = [
      { key: "profiles.full_name", label: "Nome" },
      { key: "profiles.email", label: "Email" },
      { key: "subject", label: "Assunto" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Prioridade" },
      { key: "created_at", label: "Criado em" },
  ];

  const escape = (val: any) => {
    if (val == null) return "";
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map((h) => escape(h.label)).join(",");
  const rows = tickets.map((row) =>
      headers
          .map((h) => {
              const parts = h.key.split(".");
              let val: any = row;
              for (const p of parts) {
                  if (val && p in val) {
                      val = val[p];
                  } else {
                      val = "";
                      break;
                  }
              }
              return escape(val);
          })
          .join(",")
  );

  const csv = [headerRow, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tickets_de_suporte.csv";
  a.click();
  URL.revokeObjectURL(url);
};

export function SupportTickets({
  statusFilter,
  priorityFilter,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  onTotalChange,
}: {
  statusFilter: string
  priorityFilter: string
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  onTotalChange?: (total: number) => void
}) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [replyOpen, setReplyOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newStatus, setNewStatus] = useState<string>("pendente")
  const [replyMessage, setReplyMessage] = useState<string>("")
  const [savingReply, setSavingReply] = useState(false)
  const [localSearch, setLocalSearch] = useState("")

  async function loadTickets() {
    try {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from("support_tickets")
        .select(
          `id, user_id, subject, message, status, priority, created_at, profiles ( email, full_name )`,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })

      if (statusFilter !== "todos") query = query.eq("status", statusFilter)
      if (priorityFilter !== "todos") query = query.eq("priority", priorityFilter)
      if (startDate) query = query.gte("created_at", `${startDate}T00:00:00.000Z`)
      if (endDate) query = query.lte("created_at", `${endDate}T23:59:59.999Z`)

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) {
        console.warn("Falha ao carregar relacionamento profiles, aplicando fallback:", error.message)
        let basic = supabase
          .from("support_tickets")
          .select("id, user_id, subject, message, status, priority, created_at", { count: "exact" })
          .order("created_at", { ascending: false })

        if (statusFilter !== "todos") basic = basic.eq("status", statusFilter)
        if (priorityFilter !== "todos") basic = basic.eq("priority", priorityFilter)
        if (startDate) basic = basic.gte("created_at", `${startDate}T00:00:00.000Z`)
        if (endDate) basic = basic.lte("created_at", `${endDate}T23:59:59.999Z`)
        basic = basic.range(from, to)

        const { data: basicData, error: basicError, count: basicCount } = await basic
        if (basicError) throw basicError
        
        const userIds = Array.from(new Set((basicData || []).map((t: any) => t.user_id).filter(Boolean)))
        let profileMap = new Map<string, any>()
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", userIds)
          profileMap = new Map((profilesData || []).map((p: any) => [p.id, p]))
        }
        const merged = (basicData || []).map((t: any) => ({ ...t, profiles: profileMap.get(t.user_id) || { email: 'N/A', full_name: 'Usuário desconhecido' } }))
        
        let withCounts = merged
        const ticketIds = Array.from(new Set((merged || []).map((t: any) => t.id)))
        if (ticketIds.length > 0) {
          const { data: updatesData } = await supabase
            .from("support_ticket_updates")
            .select("id, ticket_id")
            .in("ticket_id", ticketIds)
          const countsMap = new Map<string, number>()
          ;(updatesData || []).forEach((u: any) => {
            countsMap.set(u.ticket_id, (countsMap.get(u.ticket_id) || 0) + 1)
          })
          withCounts = merged.map((t: any) => ({ ...t, updates_count: countsMap.get(t.id) || 0 }))
        }
        setTickets(withCounts)
        if (typeof onTotalChange === "function") onTotalChange(basicCount ?? 0)
      } else {
        const baseTickets = data || []
        let withCounts = baseTickets
        const ticketIds = Array.from(new Set((baseTickets || []).map((t: any) => t.id)))
        if (ticketIds.length > 0) {
          const { data: updatesData } = await supabase
            .from("support_ticket_updates")
            .select("id, ticket_id")
            .in("ticket_id", ticketIds)
          const countsMap = new Map<string, number>()
          ;(updatesData || []).forEach((u: any) => {
            countsMap.set(u.ticket_id, (countsMap.get(u.ticket_id) || 0) + 1)
          })
          withCounts = baseTickets.map((t: any) => ({ ...t, updates_count: countsMap.get(t.id) || 0 }))
        }
        setTickets(withCounts)
        if (typeof onTotalChange === "function") onTotalChange(count ?? 0)
      }
    } catch (err: any) {
      console.error("Erro ao carregar tickets:", err)
      setError(err?.message || "Falha ao carregar tickets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [statusFilter, priorityFilter, page, pageSize, startDate, endDate])

  async function updateTicketStatus(ticketId: string, status: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", ticketId)

      if (error) {
        throw new Error("Falha ao atualizar o status do ticket. Verifique as permissões RLS.")
      }

      toast({
        title: "Sucesso!",
        description: "O status do ticket foi atualizado.",
      })
      loadTickets()
    } catch (err: any) {
      console.error("Erro ao atualizar ticket:", err)
      toast({
        title: "Erro ao atualizar",
        description: err.message || "Não foi possível atualizar o status do ticket.",
      })
    }
  }

  function openReplyModal(ticket: Ticket) {
    setSelectedTicket(ticket)
    setNewStatus(ticket.status)
    setReplyMessage("")
    setReplyOpen(true)
  }

  async function submitReplyAndStatus() {
    if (!selectedTicket) return
    setSavingReply(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado.")

      const { error: updateError } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", selectedTicket.id)

      if (updateError) throw updateError

      if (replyMessage.trim()) {
        const { error: replyError } = await supabase
          .from("support_ticket_updates")
          .insert({
            ticket_id: selectedTicket.id,
            user_id: user.id,
            message: replyMessage,
            new_status: newStatus,
          })
        if (replyError) throw replyError
      }

      toast({
        title: "Sucesso!",
        description: "Ticket atualizado e resposta enviada.",
      })
      setReplyOpen(false)
      loadTickets()
    } catch (err: any) {
      console.error("Erro ao salvar resposta:", err)
      toast({
        title: "Erro ao salvar",
        description: err.message || "Não foi possível salvar a resposta.",
      })
    } finally {
      setSavingReply(false)
    }
  }

  async function deleteTicket(ticketId: string) {
    if (!window.confirm("Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.")) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("support_tickets").delete().eq("id", ticketId)
      if (error) throw error
      toast({
        title: "Sucesso!",
        description: "O ticket foi excluído.",
      })
      loadTickets()
    } catch (err: any) {
      console.error("Erro ao excluir ticket:", err)
      toast({
        title: "Erro ao excluir",
        description: err.message || "Não foi possível excluir o ticket.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <p>Carregando tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded-md">
        <strong>Erro:</strong> {error}
      </div>
    )
  }

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = localSearch.toLowerCase();
    return (
      ticket.subject.toLowerCase().includes(searchLower) ||
      ticket.message.toLowerCase().includes(searchLower) ||
      ticket.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      ticket.profiles?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Tickets de Suporte</h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por assunto, mensagem ou usuário..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button onClick={() => exportTicketsCsv(filteredTickets)} variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum ticket encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Tente ajustar seus filtros de busca.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Respostas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div className="font-medium">{ticket.profiles?.full_name || "Usuário"}</div>
                  <div className="text-sm text-gray-500">{ticket.profiles?.email || "Email não disponível"}</div>
                </TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                  <Badge
                    className={`flex items-center gap-2 ${statusConfig[ticket.status as keyof typeof statusConfig]?.color || "bg-gray-400"}`}
                  >
                    {statusConfig[ticket.status as keyof typeof statusConfig]?.icon}
                    {statusConfig[ticket.status as keyof typeof statusConfig]?.label || "Desconhecido"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${priorityConfig[ticket.priority as keyof typeof priorityConfig]?.color || "bg-gray-400"}`}
                  >
                    {priorityConfig[ticket.priority as keyof typeof priorityConfig]?.label || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(ticket.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell className="text-center">{ticket.updates_count || 0}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openReplyModal(ticket)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Atualizar e Responder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTicket(ticket.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Ticket: #{selectedTicket?.id.substring(0, 8)}</DialogTitle>
            <DialogDescription>
              Atualize o status e envie uma resposta para o usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="status-select">Status do Ticket</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="reply-message">Mensagem de Resposta (Opcional)</label>
              <Textarea
                id="reply-message"
                placeholder="Digite sua resposta aqui..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={submitReplyAndStatus} disabled={savingReply}>
              {savingReply ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
