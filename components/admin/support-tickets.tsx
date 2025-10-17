"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { MessageSquare, Clock, CheckCircle2, XCircle, FileText, User, SlidersHorizontal, Ticket as TicketIcon, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface Ticket {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  profiles: {
    email: string
    full_name: string | null
  }
}

export function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTickets() {
    try {
      setError(null)
      setLoading(true)

      const supabase = createClient()
      const { data, error } = await supabase
        .from("support_tickets")
        .select(
          `
          id,
          subject,
          message,
          status,
          priority,
          created_at,
          profiles (
            email,
            full_name
          )
        `
        )
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(
          "Falha ao carregar os tickets de suporte. Verifique as permissões RLS."
        )
      }

      setTickets(data || [])
    } catch (err: any) {
      console.error("Erro detalhado:", err)
      setError(err.message || "Ocorreu um erro desconhecido.")
      toast({
        title: "Erro ao carregar tickets",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

      // Recarrega a lista para refletir a mudança
      loadTickets()
    } catch (err: any) {
      console.error("Erro ao atualizar ticket:", err)
      toast({
        title: "Erro ao atualizar",
        description: err.message || "Não foi possível atualizar o status do ticket.",
        variant: "destructive",
      })
    }
  }

  async function deleteTicket(ticketId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("support_tickets")
        .delete()
        .eq("id", ticketId)

      if (error) {
        throw new Error("Falha ao excluir o ticket. Verifique as permissões RLS.")
      }

      toast({
        title: "Sucesso!",
        description: "O ticket foi excluído permanentemente.",
      })

      loadTickets()
    } catch (err: any) {
      console.error("Erro ao excluir ticket:", err)
      toast({
        title: "Erro ao excluir",
        description: err.message || "Não foi possível excluir o ticket.",
        variant: "destructive",
      })
    }
  }

  const statusConfig: { [key: string]: { label: string; color: string } } = {
    pendente: { label: "Pendente", color: "bg-yellow-500" },
    aberto: { label: "Aberto", color: "bg-yellow-500" },
    em_andamento: { label: "Em Andamento", color: "bg-blue-500" },
    resolvido: { label: "Resolvido", color: "bg-green-500" },
    fechado: { label: "Fechado", color: "bg-red-500" },
  }

  if (loading) {
    return <Card className="p-6">Carregando tickets...</Card>
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Tickets de Suporte</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">Erro ao carregar tickets</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => {setLoading(true); loadTickets()}}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Tickets de Suporte</h2>
      {tickets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum ticket encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">Ainda não há tickets de suporte para revisar.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Usuário
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Assunto
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <TicketIcon className="mr-2 h-4 w-4" />
                    Status
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Data
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Ações
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                const statusInfo = statusConfig[ticket.status] || statusConfig.pendente
                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      {ticket.profiles?.full_name || ticket.profiles?.email}
                    </TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center w-fit">
                        <span className={`mr-2 h-2 w-2 rounded-full ${statusInfo.color}`}></span>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(ticket.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end space-x-2">
                      <Select value={ticket.status} onValueChange={(value) => updateTicketStatus(ticket.id, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="resolvido">Resolvido</SelectItem>
                          <SelectItem value="fechado">Fechado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Você tem certeza?</DialogTitle>
                            <DialogDescription>
                              Essa ação não pode ser desfeita. Isso excluirá permanentemente
                              o ticket e removerá os dados de nossos servidores.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="ghost">Cancelar</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={() => deleteTicket(ticket.id)}>
                              Excluir
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}
