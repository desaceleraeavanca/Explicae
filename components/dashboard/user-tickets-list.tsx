"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pencil, Ticket as TicketIcon, MessageSquare, Clock, CheckCircle2, XCircle, SlidersHorizontal } from "lucide-react"
import { EditTicketModal } from "./edit-ticket-modal"

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
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
        const { data, error } = await supabase
          .from("support_tickets")
          .select("id, subject, message, status, priority, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) {
          throw new Error("Não foi possível carregar seus tickets de suporte.")
        }

        setTickets(data || [])
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
                  <TableRow key={ticket.id}>
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