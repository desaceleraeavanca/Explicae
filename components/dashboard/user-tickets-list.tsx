"use client"

import { useState, useEffect, Fragment } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pencil, Ticket as TicketIcon, MessageSquare, Clock, CheckCircle2, XCircle, SlidersHorizontal, User } from "lucide-react"
import { EditTicketModal } from "./edit-ticket-modal"

interface TicketUpdate {
  id: string
  message: string
  new_status: string | null
  created_at: string
  admin?: { full_name?: string | null; email?: string | null } | null
}

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  updates?: TicketUpdate[]
}

export function UserTicketsList({ userId }: { userId: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchTickets() {
      try {
        const supabase = createClient()
        // Tenta carregar com histórico de respostas
        let { data, error } = await supabase
          .from("support_tickets")
          .select("id, subject, message, status, priority, created_at, updates:support_ticket_updates ( id, message, new_status, created_at, admin:profiles ( full_name, email ) )")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) {
          // Fallback: se a tabela de updates não existir, carrega sem o relacionamento
          console.warn("Falha ao carregar updates, tentando consulta básica:", error.message)
          const basic = await supabase
            .from("support_tickets")
            .select("id, subject, message, status, priority, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
          if (basic.error) throw new Error("Não foi possível carregar seus tickets de suporte.")
          data = basic.data
        }

        // Fallback extra: buscar updates separadamente e mesclar por ticket_id
        try {
          const ticketIds = (data || []).map((t: any) => t.id)
          if (ticketIds.length > 0) {
            const { data: updatesData } = await supabase
              .from("support_ticket_updates")
              .select("id, ticket_id, message, new_status, created_at, admin:profiles ( full_name, email )")
              .in("ticket_id", ticketIds)
              .order("created_at", { ascending: false })

            const updatesByTicket = new Map<string, any[]>()
            for (const u of (updatesData || [])) {
              const arr = updatesByTicket.get(u.ticket_id) || []
              arr.push({
                id: u.id,
                message: u.message,
                new_status: u.new_status,
                created_at: u.created_at,
                admin: u.admin || null,
              })
              updatesByTicket.set(u.ticket_id, arr)
            }

            data = (data || []).map((t: any) => ({
              ...t,
              updates: updatesByTicket.get(t.id) || t.updates || [],
            }))
          }
        } catch (mergeErr) {
          console.warn("Falha ao buscar/mesclar updates separadamente:", (mergeErr as any)?.message || mergeErr)
        }

        // Ordena updates por data desc
        const processed = (data || []).map((t: any) => ({
          ...t,
          updates: (t.updates || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        }))

        setTickets(processed)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [userId])

  const statusConfig: { [key: string]: { label: string; icon: JSX.Element; color: string } } = {
    pendente: { label: "Pendente", icon: <Clock className="mr-2 h-4 w-4" />, color: "bg-yellow-500" },
    aberto: { label: "Aberto", icon: <Clock className="mr-2 h-4 w-4" />, color: "bg-yellow-500" },
    em_andamento: { label: "Em Andamento", icon: <MessageSquare className="mr-2 h-4 w-4" />, color: "bg-blue-500" },
    resolvido: { label: "Resolvido", icon: <CheckCircle2 className="mr-2 h-4 w-4" />, color: "bg-green-500" },
    fechado: { label: "Fechado", icon: <XCircle className="mr-2 h-4 w-4" />, color: "bg-red-500" },
  }

  function handleEditClick(ticket: Ticket) {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  function handleModalClose() {
    setIsModalOpen(false)
    setSelectedTicket(null)
  }

  function handleTicketUpdated(updatedTicket: Ticket) {
    setTickets((prevTickets) =>
      prevTickets.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
    )
  }

  if (loading) {
    return <p>Carregando seus tickets...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Seus Tickets de Suporte</h2>
      {tickets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum ticket encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">Você ainda não abriu nenhum ticket de suporte.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
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
                  <Fragment key={ticket.id}>
                    <TableRow>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(ticket)}
                          disabled={ticket.status !== 'pendente' && ticket.status !== 'aberto'}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="bg-muted/30">
                        <div className="py-3 space-y-2">
                          <div className="text-sm font-medium text-muted-foreground flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Respostas do admin
                          </div>
                          {ticket.updates && ticket.updates.length > 0 ? (
                            <div className="space-y-2">
                              {ticket.updates.map((u) => (
                                <div key={u.id} className="rounded-md border p-3">
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <div className="flex items-center">
                                      <User className="mr-1 h-3 w-3" />
                                      <span>{u.admin?.full_name || 'Admin'}</span>
                                    </div>
                                    <span>
                                      {formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                  </div>
                                  <p className="text-sm">{u.message}</p>
                                  {u.new_status && (
                                    <div className="mt-2 text-xs">
                                      <span className="text-muted-foreground">Status atualizado para: </span>
                                      <Badge variant="secondary" className="ml-1">
                                        {statusConfig[u.new_status]?.label || u.new_status}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <EditTicketModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onTicketUpdated={handleTicketUpdated}
      />
    </div>
  )
}